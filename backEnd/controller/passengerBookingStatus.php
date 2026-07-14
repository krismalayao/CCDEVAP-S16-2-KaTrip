<?php
session_start();
require "../../config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "passenger") {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$bookingId = isset($_GET['booking_id']) ? (int) $_GET['booking_id'] : 0;
if ($bookingId <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid booking_id"]);
    exit();
}

$stmt = $conn->prepare("SELECT b.booking_status, r.ride_status, r.ride_id
    FROM bookings b JOIN rides r ON r.ride_id = b.ride_id
    WHERE b.booking_id = ? AND b.passenger_id = ? LIMIT 1");
$passengerId = (int) $_SESSION['user_id'];
$stmt->bind_param("ii", $bookingId, $passengerId);
$stmt->execute();
$result = $stmt->get_result();
$status = $result->fetch_assoc();

if (!$status) {
    http_response_code(404);
    echo json_encode(["error" => "Reservation not found"]);
    exit();
}

echo json_encode([
    "booking_id" => $bookingId,
    "booking_status" => $status['booking_status'],
    "ride_status" => $status['ride_status'],
    "ride_id" => (int) $status['ride_id']
]);
?>