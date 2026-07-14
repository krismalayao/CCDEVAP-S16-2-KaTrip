<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Unauthorized"]);
        exit();
    }

    $input = json_decode(file_get_contents("php://input"), true);
    $rideId = isset($input['rideId']) ? (int) $input['rideId'] : 0;

    if ($rideId <= 0) {
        echo json_encode(["success" => false, "error" => "Missing or invalid rideId"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $ride = getRideById($conn, $rideId, $driverId);

    if (!$ride) {
        echo json_encode(["success" => false, "error" => "Trip not found."]);
        exit();
    }

    if ($ride['ride_status'] !== 'scheduled') {
        echo json_encode(["success" => false, "error" => "Only upcoming trips can be edited."]);
        exit();
    }

    // Basic input validation
    $date = $input['date'] ?? null;
    $time = $input['time'] ?? null;
    $totalSeats = isset($input['totalSeats']) ? (int) $input['totalSeats'] : 0;
    $fare = isset($input['fare']) ? (float) $input['fare'] : -1;

    if (!$date || !$time || $totalSeats <= 0 || $fare < 0) {
        echo json_encode(["success" => false, "error" => "Missing or invalid trip details."]);
        exit();
    }

    // Can't set total seats below the number of passengers already booked
    $bookedCount = count(array_filter($ride['bookings'], fn($b) => $b['booking_status'] === 'accepted'));
    if ($totalSeats < $bookedCount) {
        echo json_encode(["success" => false, "error" => "Total seats can't be less than the $bookedCount passenger(s) already booked."]);
        exit();
    }

    // Recompute available seats based on the new total
    $availableSeats = $totalSeats - $bookedCount;

    // 30-minute edit window, same rule as cancellation
    $departure = new DateTime($ride['departure_date'] . ' ' . $ride['departure']);
    $minutesUntilDeparture = ($departure->getTimestamp() - time()) / 60;
    if ($minutesUntilDeparture < 30) {
        echo json_encode(["success" => false, "error" => "Trips can only be edited at least 30 minutes before departure."]);
        exit();
    }

    $ok = updateRideDetails($conn, $rideId, $driverId, [
        'departure_date'  => $date,
        'departure_time'  => $time,
        'total_seats'     => $totalSeats,
        'available_seats' => $availableSeats,
        'cost'            => $fare
    ]);

    echo json_encode(["success" => (bool) $ok]);
?>