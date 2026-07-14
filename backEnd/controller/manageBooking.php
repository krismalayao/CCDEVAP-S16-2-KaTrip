<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        echo json_encode(["success" => false, "error" => "Unauthorized"]);
        exit();
    }

    $input = json_decode(file_get_contents("php://input"), true);
    $bookingId = isset($input['bookingId']) ? (int) $input['bookingId'] : 0;
    $rideId    = isset($input['rideId']) ? (int) $input['rideId'] : 0;
    $status    = isset($input['status']) ? $input['status'] : '';

    $allowedStatuses = ['accepted', 'rejected', 'cancelled'];

    if ($bookingId <= 0 || $rideId <= 0 || !in_array($status, $allowedStatuses)) {
        echo json_encode(["success" => false, "error" => "Missing or invalid parameters."]);
        exit();
    }

    $driverId = $_SESSION["user_id"];

    // updateBookingStatus already scopes the update to rides owned by this driver
    $ok = updateBookingStatus($conn, $bookingId, $rideId, $driverId, $status);
    echo json_encode(["success" => (bool) $ok]);
?>