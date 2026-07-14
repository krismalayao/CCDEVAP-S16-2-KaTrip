<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Unauthorized"]);
        exit();
    }

    $input = json_decode(file_get_contents("php://input"), true);
    $rideId = isset($input['rideId']) ? (int) $input['rideId'] : 0;

    if ($rideId <= 0) {
        echo json_encode(["success" => false, "error" => "Missing or invalid rideId"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $ride = getRideById($conn, $rideId, $driverId);

    if (!$ride) {
        echo json_encode(["success" => false, "error" => "Trip not found."]);
        exit();
    }

    if ($ride['ride_status'] !== 'ongoing') {
        echo json_encode(["success" => false, "error" => "Only ongoing trips can be ended."]);
        exit();
    }

    $ok = updateRideStatus($conn, $rideId, $driverId, 'completed');
    echo json_encode(["success" => (bool) $ok]);
?>