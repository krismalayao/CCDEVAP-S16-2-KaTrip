<?php
session_start();

include "../../config/db.php";
include "../model/passengerDashboardModel.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) 
{
    echo json_encode([]);
    exit();
}

$user_id = $_SESSION['user_id'];

$rides = getUpcomingRides($conn, $user_id);

echo json_encode($rides);

?>