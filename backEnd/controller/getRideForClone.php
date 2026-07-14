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

    $rideId = isset($_GET['ride_id']) ? (int) $_GET['ride_id'] : 0;
    if ($rideId <= 0) {
        echo json_encode(["status" => "error", "message" => "Missing or invalid ride_id"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $ride = getRideById($conn, $rideId, $driverId);

    if (!$ride) {
        echo json_encode(["status" => "error", "message" => "Trip not found."]);
        exit();
    }

    // No status check here — completed/cancelled trips are clonable too.

    echo json_encode([
        "status" => "success",
        "ride" => [
            "origin"           => $ride['origin'],
            "origin_name"      => $ride['origin_name'],
            "origin_lat"       => (float) $ride['origin_lat'],
            "origin_lng"       => (float) $ride['origin_lng'],
            "destination"      => $ride['destination'],
            "destination_name" => $ride['destination_name'],
            "dest_lat"         => (float) $ride['dest_lat'],
            "dest_lng"         => (float) $ride['dest_lng'],
            "total_seats"      => (int) $ride['total_seats'],
            "landmarks"        => array_map(fn($lm) => [
                "name" => $lm['landmark_name'],
                "lat"  => (float) $lm['lat'],
                "lng"  => (float) $lm['lng']
            ], $ride['landmarks'])
        ]
    ]);
?>