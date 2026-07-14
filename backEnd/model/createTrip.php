<?php
// =============================================================================
// ENDPOINT — POST /backEnd/model/createTrip.php
// Called by driverCreateTrip.js when driver submits the create trip form
// =============================================================================
session_start();
header("Content-Type: application/json");
require "../../config/db.php";
require "tripModel.php";

// ─── Auth check ──────────────────────────────────────────────────────────────
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'driver') {
    echo json_encode(["status" => "error", "message" => "Unauthorized."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    exit;
}

// ─── Parse and validate input ────────────────────────────────────────────────
$body = json_decode(file_get_contents("php://input"), true);

$required = ['origin','origin_lat','origin_lng','destination','dest_lat','dest_lng','departure_date','departure_time','total_seats','cost'];
foreach ($required as $field) {
    if (empty($body[$field])) {
        echo json_encode(["status" => "error", "message" => "Missing field: $field"]);
        exit;
    }
}

$driverId = $_SESSION['user_id'];
$data     = [
    'origin'         => $body['origin'],
    'origin_lat'     => floatval($body['origin_lat']),
    'origin_lng'     => floatval($body['origin_lng']),
    'destination'    => $body['destination'],
    'dest_lat'       => floatval($body['dest_lat']),
    'dest_lng'       => floatval($body['dest_lng']),
    'departure_date' => $body['departure_date'],
    'departure_time' => $body['departure_time'],
    'total_seats'    => intval($body['total_seats']),
    'cost'           => floatval($body['cost']),
];
$landmarks = $body['landmarks'] ?? []; // array of { name, lat, lng }

// ─── Insert ride ─────────────────────────────────────────────────────────────
$rideId = createRide($conn, $driverId, $data);
if (!$rideId || is_array($rideId)) {
    echo json_encode([
        "status"  => "error",
        "message" => "Failed to create ride.",
        "db_error" => is_array($rideId) ? $rideId['error'] : $conn->error
    ]);
    exit;
}

// ─── Insert landmarks ────────────────────────────────────────────────────────
if (!empty($landmarks)) {
    createLandmarks($conn, $rideId, $landmarks);
}

echo json_encode(["status" => "success", "message" => "Ride created!", "ride_id" => $rideId]);
exit;