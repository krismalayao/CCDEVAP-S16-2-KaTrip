<?php
// Handles a part of the cancellation and reserve feature
session_start();
require_once "../model/reserveModel.php";

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $ride_id = $_POST['ride_id'] ?? null;
    $passenger_id = $_SESSION['user_id'] ?? null;

    if (!$ride_id || !$passenger_id) {
        echo json_encode([
            "success" => false,
            "message" => "Missing data"
        ]);
        exit;
    }

    $result = createBooking($ride_id, $passenger_id);
    echo json_encode($result);
}
?>