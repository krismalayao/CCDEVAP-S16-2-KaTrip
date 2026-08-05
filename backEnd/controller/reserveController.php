<?php
session_start();
header("Content-Type: application/json");
require_once "../../config/db.php";        // ← add db.php
require_once "../model/reserveModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ride_id      = $_POST['ride_id'] ?? null;
    $passenger_id = $_SESSION['user_id'] ?? null;

    if (!$ride_id || !$passenger_id) {
        echo json_encode(["success" => false, "message" => "Missing data."]);
        exit;
    }

    $result = createBooking($conn, $ride_id, $passenger_id); 
    echo json_encode($result);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
?>