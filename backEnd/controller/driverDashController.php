<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";
    require "../../backEnd/model/tripModel.php";

    header("Content-Type: application/json");

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }

    $driverId = $_SESSION["user_id"];
    $rides = getRidesByDriver($conn, $driverId);

    $trips = [];
    foreach ($rides as $r) {
        $landmarks = getLandmarksForRide($conn, $r['ride_id']);
        $pickups = [];
        foreach ($landmarks as $lm) {
            $pickups[] = $lm['landmark_name'];
        }

        $trips[] = [
            "id"         => (int) $r['ride_id'],
            "status"     => mapRideStatusToGroup($r['ride_status']),
            "from"       => $r['origin'],
            "to"         => $r['destination'],
            "date"       => $r['departure_date'],
            "time"       => formatRideTime($r['departure']),
            "passengers" => (int) $r['total_seats'] - (int) $r['available_seats'],
            "capacity"   => (int) $r['total_seats'],
            "fare"       => (float) $r['cost'],
            "pickups"    => $pickups];
    }

    echo json_encode(["trips" => $trips]);
?>