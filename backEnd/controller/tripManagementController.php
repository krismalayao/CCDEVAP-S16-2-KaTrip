<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/tripManagementModel.php";

    if(isset($_POST["action"])) {
        $action = $_POST["action"];

        if ($action == "updateStatus") { // Change RIde Status
            $tripId = $_POST["ride_id"];
            $tripStat = $_POST["ride_status"];

            updateTripStatus($conn, $tripId, $tripStat);
        }

        header("Location: ../../frontEnd/admin/tripManagement.php");
        exit();
    }

    $listOfTrips = getAllTrips($conn);
?>