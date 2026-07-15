<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $requests = getPendingBookingsByDriver($conn, $driverId);

    echo json_encode(["status" => "success", "requests" => $requests]);
?>