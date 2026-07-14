<?php
require_once "../model/cancelModel.php";

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $booking_id = $_POST['booking_id'] ?? null;

    if (!$booking_id) {
        echo json_encode([
            "success" => false,
            "message" => "Missing booking id"
        ]);
        exit;
    }

    $result = cancelBooking($booking_id);

    echo json_encode($result);
}
?>