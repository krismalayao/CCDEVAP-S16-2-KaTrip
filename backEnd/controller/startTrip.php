<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        http_response_code(403);//Test for unauthorized access, debugging :)
        echo json_encode(["success" => false, "error" => "Unauthorized"]);
        exit();
    }

    $input = json_decode(file_get_contents("php://input"), true);
    $rideId = isset($input['rideId']) ? (int) $input['rideId'] : 0;

    if ($rideId <= 0) {
        http_response_code(400);//Test for invalid rideId, debugging, yay!
        echo json_encode(["success" => false, "error" => "Missing or invalid rideId"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $ride = getRideById($conn, $rideId, $driverId);

    if (!$ride) {
        echo json_encode(["success" => false, "error" => "Trip not found."]);
        exit();
    }

    if ($ride['ride_status'] !== 'scheduled') {
        echo json_encode(["success" => false, "error" => "Only a scheduled trip can be started."]);
        exit();
    }

    foreach ($ride['bookings'] as $booking) {
        if ($booking['booking_status'] === 'pending') {
            echo json_encode(["success" => false, "error" => "Please approve or reject all pending reservations before starting the trip."]);
            exit();
        }
    }

    $ok = updateRideStatus($conn, $rideId, $driverId, 'ongoing');
    echo json_encode(["success" => (bool) $ok]);
?>
