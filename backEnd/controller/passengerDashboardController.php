<?php
// Handles passenger analytics in dashboard
session_start();
include "../../config/db.php";
include "../model/passengerDashboardModel.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) 
{
    echo json_encode([
        'monthly_spend' => array_fill(0, 12, 0),
        'average_per_trip' => 0,
        'average_per_location' => 0,
        'location_spend' => []
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];

$data = getPassengerSpendPerMonth($conn, $user_id);
$averagePerTrip = getPassengerAveragePerTrip($conn, $user_id);
$averagePerLocation = getPassengerAveragePerLocation($conn, $user_id);
$locationSpend = getPassengerSpendByLocation($conn, $user_id, 5);

$totals = array_fill(0, 12, 0.0);

foreach ($data as $row) 
{
    $monthIndex = (int)$row['month'] - 1; 
    $totals[$monthIndex] = (float)$row['total'];
}

echo json_encode([
    'monthly_spend' => $totals,
    'average_per_trip' => $averagePerTrip,
    'average_per_location' => $averagePerLocation,
    'location_spend' => $locationSpend
]);


?>
