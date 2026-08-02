<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/tripManagementModel.php";

    if (isset($_POST["action"])) {
        $action = $_POST["action"];
        
        if ($action == "addTrip") { // Adding Trip
            $driverId = $_POST["driver_id"];
            $origin = $_POST["origin"];
            $destination = $_POST["destination"];
            $departureDate = $_POST["departure_date"];
            $departure = $_POST["departure"];
            $totalSeats = $_POST["total_seats"];
            $availableSeats = $_POST["available_seats"];
            $cost = $_POST["cost"];
            $rideStatus = $_POST["ride_status"];

            $result = addTrip($conn, $driverId, $origin, $destination, $departureDate, $departure, $totalSeats, $availableSeats, $cost, $rideStatus);

            if ($result) {
                header("Location: ../../frontEnd/admin/tripManagement.php?message=successfulAdd");
                exit();
            } else {
                header("Location: ../../frontEnd/admin/tripManagement.php?message=duplicateAdd");
                exit();
            }
        } elseif ($action == "editTrip") { // Editing Trip
            $rideId = $_POST["ride_id"];
            $driverId = $_POST["driver_id"];
            $origin = $_POST["origin"];
            $destination = $_POST["destination"];
            $departureDate = $_POST["departure_date"];
            $departure = $_POST["departure"];
            $totalSeats = $_POST["total_seats"];
            $availableSeats = $_POST["available_seats"];
            $cost = $_POST["cost"];
            $rideStatus = $_POST["ride_status"];

            $result = editTrip($conn, $rideId, $driverId, $origin, $destination, $departureDate, $departure, $totalSeats, $availableSeats, $cost, $rideStatus);

            if ($result) {
                header("Location: ../../frontEnd/admin/tripManagement.php?message=successfulEdit");
                exit();
            } else {
                header("Location: ../../frontEnd/admin/tripManagement.php?message=duplicateEdit");
                exit();
            }
        } elseif ($action == "deleteTrip") { // Delete Trip
            if (isset($_POST["ride_id"])) {
                $rideId = $_POST["ride_id"];
                deleteTrip($conn, $rideId);
            }
        }

        header("Location: ../../frontEnd/admin/tripManagement.php");
        exit();
    }

    $specificTrips = $_GET["search"] ?? "";
    $listOfTrips = getAllTrips($conn, $specificTrips);
?>