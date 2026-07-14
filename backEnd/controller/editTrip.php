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

    // ── Validate input ────────────────────────────────────────────────────────
    $required = ['origin', 'origin_lat', 'origin_lng', 'destination', 'dest_lat', 'dest_lng', 'departure_date', 'departure_time', 'total_seats', 'cost'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            echo json_encode(["success" => false, "error" => "Missing field: $field"]);
            exit();
        }
    }

    $totalSeats = (int) $input['total_seats'];
    $fare       = (float) $input['cost'];

    if ($totalSeats <= 0 || $fare < 0) {
        echo json_encode(["success" => false, "error" => "Invalid seats or fare."]);
        exit();
    }

    // Can't set total seats below the number of passengers already booked
    $bookedCount = count(array_filter($ride['bookings'], fn($b) => $b['booking_status'] === 'accepted'));
    if ($totalSeats < $bookedCount) {
        echo json_encode(["success" => false, "error" => "Total seats can't be less than the $bookedCount passenger(s) already booked."]);
        exit();
    }
    $availableSeats = $totalSeats - $bookedCount;

    // 30-minute edit window, same rule as cancellation
    $departure = new DateTime($ride['departure_date'] . ' ' . $ride['departure']);
    $minutesUntilDeparture = ($departure->getTimestamp() - time()) / 60;
    if ($minutesUntilDeparture < 30) {
        echo json_encode(["success" => false, "error" => "Trips can only be edited at least 30 minutes before departure."]);
        exit();
    }

    $ok = updateRideDetails($conn, $rideId, $driverId, [
        'origin'           => $input['origin'],
        'origin_name'      => $input['origin_name'] ?? null,
        'origin_lat'       => (float) $input['origin_lat'],
        'origin_lng'       => (float) $input['origin_lng'],
        'destination'      => $input['destination'],
        'destination_name' => $input['destination_name'] ?? null,
        'dest_lat'         => (float) $input['dest_lat'],
        'dest_lng'         => (float) $input['dest_lng'],
        'departure_date'   => $input['departure_date'],
        'departure_time'   => $input['departure_time'],
        'total_seats'      => $totalSeats,
        'available_seats'  => $availableSeats,
        'cost'             => $fare
    ]);

    if ($ok && isset($input['landmarks'])) {
        replaceLandmarks($conn, $rideId, $input['landmarks']);
    }

    echo json_encode(["success" => (bool) $ok]);
?>