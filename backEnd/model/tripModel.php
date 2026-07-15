<?php
// =============================================================================
// TRIP MODEL — DB queries for rides and landmarks
// =============================================================================

// ─── Create a new ride ───────────────────────────────────────────────────────
function createRide($conn, $driverId, $data) {
    $stmt = $conn->prepare("
        INSERT INTO rides (
            driver_id, origin, origin_name, origin_lat, origin_lng,
            destination, destination_name, dest_lat, dest_lng,
            departure_date, departure, total_seats, available_seats,
            cost, ride_status, schedule_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NULL)
    ");

    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return ["error" => "Prepare failed: " . $conn->error];
    }

    $stmt->bind_param(
        "issddssddssiid",
        $driverId,
        $data['origin'],          $data['origin_name'],
        $data['origin_lat'],      $data['origin_lng'],
        $data['destination'],     $data['destination_name'],
        $data['dest_lat'],        $data['dest_lng'],
        $data['departure_date'],  $data['departure_time'],
        $data['total_seats'],     $data['total_seats'],
        $data['cost']
    );

    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        return ["error" => "Execute failed: " . $stmt->error];
    }

    return $conn->insert_id;
}

// ─── Save pickup stops for a ride ────────────────────────────────────────────
function createLandmarks($conn, $rideId, $landmarks) {
    $stmt = $conn->prepare("
        INSERT INTO ride_landmarks (ride_id, landmark_name, landmark_number, lat, lng)
        VALUES (?, ?, ?, ?, ?)
    ");
    foreach ($landmarks as $i => $lm) {
        $order = $i + 1;
        $stmt->bind_param("isidd", $rideId, $lm['name'], $order, $lm['lat'], $lm['lng']);
        if (!$stmt->execute()) return false;
    }
    return true;
}

// ─── Get all rides by a driver ────────────────────────────────────────────────
function getRidesByDriver($conn, $driverId) {
    $stmt = $conn->prepare("
        SELECT r.*,
               COUNT(b.booking_id) AS passenger_count
        FROM rides r
        LEFT JOIN bookings b ON b.ride_id = r.ride_id AND b.booking_status = 'accepted'
        WHERE r.driver_id = ?
        GROUP BY r.ride_id
        ORDER BY r.departure_date DESC, r.departure DESC
    ");
    $stmt->bind_param("i", $driverId);
    $stmt->execute();
    $rides = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Attach landmarks to each ride
    foreach ($rides as &$ride) {
        $stmt2 = $conn->prepare("
            SELECT * FROM ride_landmarks
            WHERE ride_id = ? ORDER BY landmark_number ASC
        ");
        $stmt2->bind_param("i", $ride['ride_id']);
        $stmt2->execute();
        $ride['landmarks'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    return $rides;
}

// ─── Get a single ride with its landmarks and bookings ───────────────────────
function getRideById($conn, $rideId, $driverId) {
    $stmt = $conn->prepare("
        SELECT r.* FROM rides r
        WHERE r.ride_id = ? AND r.driver_id = ?
    ");
    $stmt->bind_param("ii", $rideId, $driverId);
    $stmt->execute();
    $ride = $stmt->get_result()->fetch_assoc();
    if (!$ride) return null;

    // Attach landmarks
    $stmt2 = $conn->prepare("
        SELECT * FROM ride_landmarks
        WHERE ride_id = ? ORDER BY landmark_number ASC");

    $stmt2->bind_param("i", $rideId);
    $stmt2->execute();
    $ride['landmarks'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

    // Attach accepted bookings with passenger info
    $stmt3 = $conn->prepare("
        SELECT b.*, u.first_name, u.last_name
        FROM bookings b
        JOIN users u ON u.user_id = b.passenger_id
        WHERE b.ride_id = ? AND b.booking_status IN ('pending', 'accepted')");

    $stmt3->bind_param("i", $rideId);
    $stmt3->execute();
    $ride['bookings'] = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

    return $ride;
}

// ─── Update ride status ───────────────────────────────────────────────────────
function updateRideStatus($conn, $rideId, $driverId, $status) {
    $stmt = $conn->prepare("
        UPDATE rides SET ride_status = ?
        WHERE ride_id = ? AND driver_id = ?");

    $stmt->bind_param("sii", $status, $rideId, $driverId);
    return $stmt->execute();
}

// ─── Update full ride details (route, schedule, seats, fare) ─────────────────
function updateRideDetails($conn, $rideId, $driverId, $data) {
    $stmt = $conn->prepare("
        UPDATE rides
        SET origin = ?, origin_name = ?, origin_lat = ?, origin_lng = ?,
            destination = ?, destination_name = ?, dest_lat = ?, dest_lng = ?,
            departure_date = ?, departure = ?, total_seats = ?, available_seats = ?, cost = ?
        WHERE ride_id = ? AND driver_id = ?
    ");

    $stmt->bind_param(
        "ssddssddssiidii",
        $data['origin'],          $data['origin_name'],
        $data['origin_lat'],      $data['origin_lng'],
        $data['destination'],     $data['destination_name'],
        $data['dest_lat'],        $data['dest_lng'],
        $data['departure_date'],  $data['departure_time'],
        $data['total_seats'],     $data['available_seats'],
        $data['cost'],
        $rideId,                  $driverId
    );

    return $stmt->execute();
}

// ─── Replace all pickup stops for a ride (used on edit) ──────────────────────
function replaceLandmarks($conn, $rideId, $landmarks) {
    $del = $conn->prepare("DELETE FROM ride_landmarks WHERE ride_id = ?");
    $del->bind_param("i", $rideId);
    $del->execute();

    if (!empty($landmarks)) {
        return createLandmarks($conn, $rideId, $landmarks);
    }
    return true;
}

// ─── Get a driver's display info (name + vehicle) ────────────────────────────
function getDriverProfile($conn, $driverId) {
    $stmt = $conn->prepare("
        SELECT u.first_name, u.last_name,
            d.vehicle_model, d.plate_number, d.vehicle_color
        FROM users u
        JOIN driver_profiles d ON d.driver_id = u.user_id
        WHERE u.user_id = ?");

    $stmt->bind_param("i", $driverId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

// ─── Get landmarks for a ride ─────────────────────────────────
function getLandmarksForRide($conn, $rideId) {
    $stmt = $conn->prepare("
        SELECT landmark_name, lat, lng
        FROM ride_landmarks
        WHERE ride_id = ?
        ORDER BY landmark_number ASC");

    $stmt->bind_param("i", $rideId);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}


function mapRideStatusToGroup($rideStatus) {
    if ($rideStatus == 'scheduled') return 'upcoming';
    if ($rideStatus == 'ongoing') return 'ongoing';
    if ($rideStatus == 'completed') return 'completed';
    if ($rideStatus == 'cancelled') return 'cancelled';
    return 'upcoming';
}


function formatRideTime($time) {
    if (!$time) return '';
    return date('g:i A', strtotime($time));
}

// ─── Accept or reject a booking ──────────────────────────────────────────────
function updateBookingStatus($conn, $bookingId, $rideId, $driverId, $status) {
    $lookup = $conn->prepare("
        SELECT b.booking_status
        FROM bookings b
        JOIN rides r ON r.ride_id = b.ride_id
        WHERE b.booking_id = ? AND b.ride_id = ? AND r.driver_id = ?
        LIMIT 1
    ");
    if (!$lookup) {
        return ["success" => false, "error" => "Could not validate booking status."];
    }

    $lookup->bind_param("iii", $bookingId, $rideId, $driverId);
    $lookup->execute();
    $current = $lookup->get_result()->fetch_assoc();

    if (!$current) {
        return ["success" => false, "error" => "Booking not found for this trip."];
    }

    $currentStatus = $current['booking_status'];
    $requiredCurrent = null;

    if ($status === 'accepted') {
        if ($currentStatus === 'cancelled') {
            return [
                "success" => false,
                "errorCode" => "PASSENGER_CANCELLED",
                "error" => "Passenger canceled their reservation."
            ];
        }
        $requiredCurrent = 'pending';
    } elseif ($status === 'rejected') {
        $requiredCurrent = 'pending';
    } elseif ($status === 'cancelled') {
        $requiredCurrent = 'accepted';
    }

    $stmt = $conn->prepare("
        UPDATE bookings b
        JOIN rides r ON r.ride_id = b.ride_id
        SET b.booking_status = ?
        WHERE b.booking_id = ?
          AND b.ride_id = ?
          AND r.driver_id = ?
          AND b.booking_status = ?
    ");
    if (!$stmt) {
        return ["success" => false, "error" => "Could not update booking status."];
    }

    $stmt->bind_param("siiis", $status, $bookingId, $rideId, $driverId, $requiredCurrent);
    $ok = $stmt->execute();

    if (!$ok) {
        return ["success" => false, "error" => "Could not update this passenger."];
    }

    if ($stmt->affected_rows === 0) {
        return ["success" => false, "error" => "Booking status changed. Please refresh and try again."];
    }

    return ["success" => true];
}
