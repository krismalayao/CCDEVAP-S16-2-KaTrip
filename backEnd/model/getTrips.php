<?php
// =============================================================================
// ENDPOINT — GET /backEnd/model/getTrips.php
// Returns all rides for the logged-in driver
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

$driverId = $_SESSION['user_id'];
$rides    = getRidesByDriver($conn, $driverId);

echo json_encode(["status" => "success", "rides" => $rides]);
exit;