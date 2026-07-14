<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }

    $rideId = isset($_GET['ride_id']) ? (int) $_GET['ride_id'] : 0;
    if ($rideId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid ride_id"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $ride = getRideById($conn, $rideId, $driverId);

    if (!$ride) {
        echo json_encode(["error" => "Trip not found."]);
        exit();
    }

    $driver = getDriverProfile($conn, $driverId);

    // Build the route: origin -> each pickup landmark, in order -> destination
    $route = [];
    $route[] = ["label" => $ride['origin_name'] ?: $ride['origin'], "type" => "origin",
    "address" => $ride['origin'],
    "lat" => $ride['origin_lat'] !== null ? (float) $ride['origin_lat'] : null,
    "lng" => $ride['origin_lng'] !== null ? (float) $ride['origin_lng'] : null];
    foreach ($ride['landmarks'] as $lm) {
        $route[] = ["label" => $lm['landmark_name'], "type" => "pickup",
            "lat" => $lm['lat'] !== null ? (float) $lm['lat'] : null,
            "lng" => $lm['lng'] !== null ? (float) $lm['lng'] : null];
    }
    $route[] = ["label" => $ride['destination_name'] ?: $ride['destination'], "type" => "destination",
        "address" => $ride['destination'],
        "lat" => $ride['dest_lat'] !== null ? (float) $ride['dest_lat'] : null,
        "lng" => $ride['dest_lng'] !== null ? (float) $ride['dest_lng'] : null];

    // Split passengers by booking status, and total up accepted seats for the fare split
    $acceptedSeats = 0;
    foreach ($ride['bookings'] as $b) {
        if ($b['booking_status'] == 'accepted') {
            $acceptedSeats += $b['seat_reserved'];
        }
    }

    if ($acceptedSeats > 0) {
        $farePerPax = round($ride['cost'] / $acceptedSeats, 2); //ride / acceptedSeats (*or passengers). 2 decimal places for currency. 
    } else {
        $farePerPax = (float) $ride['cost'];
    }

    $passengers = [];
    foreach ($ride['bookings'] as $b) {
        $passengers[] = [
            "bookingId" => (int) $b['booking_id'],
            "name"      => $b['first_name'],
            "seats"     => (int) $b['seat_reserved'],
            "fee"       => $farePerPax * (int) $b['seat_reserved'],
            "status"    => $b['booking_status']];
    }

    echo json_encode([
        "rideId"      => (int) $ride['ride_id'],
        "rideStatus"  => $ride['ride_status'],
        "driverName"  => trim($driver['first_name'] . ' ' . $driver['last_name']),
        "vehicleInfo" => $driver['vehicle_model'] . ' - ' . $driver['plate_number'] . ' - ' . $driver['vehicle_color'],
        "route"       => $route,
        "farePerPax"  => $farePerPax,
        "fareTotal"   => (float) $ride['cost'],
        "paxBadge"    => $acceptedSeats . ' / ' . $ride['total_seats'],
        "passengers"  => $passengers]);
?>
