// Handles the chart in passenger dashboard
<?php
session_start();
include "../../config/db.php";
include "../model/passengerDashboardModel.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) 
{
    echo json_encode(array_fill(0, 12, 0));
    exit();
}

$user_id = $_SESSION['user_id'];

$data = getBookingsPerMonth($conn, $user_id);

$totals = array_fill(0, 12, 0);

foreach ($data as $row) 
{
    $monthIndex = (int)$row['month'] - 1; 
    $totals[$monthIndex] = (int)$row['total'];
}

echo json_encode($totals);


?>
