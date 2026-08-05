<?php
session_start();
header("Content-Type: application/json");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require "../../config/db.php";
require "tripModel.php";

try {

    // ===========================
    // SESSION DEBUG
    // ===========================
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Session user_id is missing.");
    }

    if (!isset($_SESSION['role'])) {
        throw new Exception("Session role is missing.");
    }

    if ($_SESSION['role'] !== 'driver') {
        throw new Exception("User is not a driver.");
    }

    // ===========================
    // REQUEST METHOD
    // ===========================
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Request method is not POST.");
    }

    // ===========================
    // RAW BODY
    // ===========================
    $raw = file_get_contents("php://input");

    if (!$raw) {
        throw new Exception("Request body is empty.");
    }

    // ===========================
    // JSON
    // ===========================
    $body = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON: " . json_last_error_msg());
    }

    // ===========================
    // REQUIRED FIELDS
    // ===========================
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

        if (!isset($body[$field])) {
            throw new Exception("Missing field: $field");
        }

        if ($body[$field] === "") {
            throw new Exception("Empty field: $field");
        }
    }

    // ===========================
    // BUILD DATA
    // ===========================
    $driverId = $_SESSION['user_id'];

    $data = [
        'origin'           => $body['origin'],
        'origin_name'      => $body['origin_name'] ?? null,
        'origin_lat'       => (float)$body['origin_lat'],
        'origin_lng'       => (float)$body['origin_lng'],

        'destination'      => $body['destination'],
        'destination_name' => $body['destination_name'] ?? null,
        'dest_lat'         => (float)$body['dest_lat'],
        'dest_lng'         => (float)$body['dest_lng'],

        'departure_date'   => $body['departure_date'],
        'departure_time'   => $body['departure_time'],

        'total_seats'      => (int)$body['total_seats'],
        'cost'             => (float)$body['cost']
    ];

    $landmarks = $body['landmarks'] ?? [];

    // ===========================
    // INSERT RIDE
    // ===========================
    $rideId = createRide($conn, $driverId, $data);

    if (!$rideId || is_array($rideId)) {

        throw new Exception(
            is_array($rideId)
                ? $rideId['error']
                : "createRide() returned false."
        );
    }

    // ===========================
    // INSERT LANDMARKS
    // ===========================
    if (!empty($landmarks)) {

        $ok = createLandmarks($conn, $rideId, $landmarks);

        if (!$ok) {
            throw new Exception("Failed inserting landmarks.");
        }
    }

    echo json_encode([
        "status" => "success",
        "ride_id" => $rideId
    ]);

} catch (Throwable $e) {

    echo json_encode([

        "status" => "error",

        "message" => $e->getMessage(),

        "session" => $_SESSION,

        "raw_body" => isset($raw) ? $raw : null,

        "decoded_body" => isset($body) ? $body : null,

        "mysql_error" => $conn->error
    ]);
}