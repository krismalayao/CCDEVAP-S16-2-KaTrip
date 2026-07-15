<?php
session_start();

include "../../config/db.php";
include "../model/browseRidesModel.php";

header('Content-Type: application/json');

$passengerId = null;
if (isset($_SESSION['user_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'passenger') {
	$passengerId = (int) $_SESSION['user_id'];
}

$rides = getAvailableRides($conn, $passengerId);

echo json_encode($rides);
?>
