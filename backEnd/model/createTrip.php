<?php
session_start();
header("Content-Type: application/json");

require "../../config/db.php";
require "tripModel.php";

try {

    // Authentication
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'driver') {
        throw new Exception("Unauthorized.");
    }

    // Request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method.");
    }

    // Read JSON body
    $body = json_decode(file_get_contents("php://input"), true);

    if ($body === null) {
        throw new Exception("Invalid request data.");
    }

    // Validate required fields
    $required = [
        'origin',
        'origin_lat',
        'origin_lng',
        'destination',
        'dest_lat',
        'dest_lng',
        'departure_date',
        'departure_time',
        'total_seats',
        'cost'
    ];

    foreach ($required as $field) {
        if (!isset($body[$field]) || $body[$field] === '') {
            throw new Exception("Missing field: {$field}");
        }
    }

    // Prepare ride data
    $driverId = $_SESSION['user_id'];

    $data = [
        'origin'            => $body['origin'],
        'origin_name'       => $body['origin_name'] ?? null,
        'origin_lat'        => (float)$body['origin_lat'],
        'origin_lng'        => (float)$body['origin_lng'],
        'destination'       => $body['destination'],
        'destination_name'  => $body['destination_name'] ?? null,
        'dest_lat'          => (float)$body['dest_lat'],
        'dest_lng'          => (float)$body['dest_lng'],
        'departure_date'    => $body['departure_date'],
        'departure_time'    => $body['departure_time'],
        'total_seats'       => (int)$body['total_seats'],
        'cost'              => (float)$body['cost']
    ];

    $landmarks = $body['landmarks'] ?? [];

    // Create ride
    $rideId = createRide($conn, $driverId, $data);

    if (!$rideId) {
        throw new Exception("Failed to create ride.");
    }

    // Save landmarks
    if (!empty($landmarks)) {
        createLandmarks($conn, $rideId, $landmarks);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Ride created successfully.",
        "ride_id" => $rideId
    ]);

} catch (Throwable $e) {

    // Log the error on the server
    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => "An unexpected server error occurred."
    ]);
}

exit;