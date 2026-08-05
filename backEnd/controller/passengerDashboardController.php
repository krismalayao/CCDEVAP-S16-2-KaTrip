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
        'monthly_ride_count' => array_fill(0, 12, 0),
        'average_per_trip' => 0,
        'average_per_location' => 0,
        'location_spend' => [],
        'most_frequent_route' => null
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];

$data = getPassengerSpendPerMonth($conn, $user_id);
$rideCountData = getPassengerRidesPerMonth($conn, $user_id);
$averagePerTrip = getPassengerAveragePerTrip($conn, $user_id);
$averagePerLocation = getPassengerAveragePerLocation($conn, $user_id);
$locationSpend = getPassengerSpendByLocation($conn, $user_id, 5);
$mostFrequentRoute = getPassengerMostFrequentRoute($conn, $user_id);

$totals = array_fill(0, 12, 0.0);
foreach ($data as $row) 
{
    $monthIndex = (int)$row['month'] - 1; 
    $totals[$monthIndex] = (float)$row['total'];
}

$rideCounts = array_fill(0, 12, 0);
foreach ($rideCountData as $row)
{
    $monthIndex = (int)$row['month'] - 1;
    $rideCounts[$monthIndex] = (int)$row['total'];
}

echo json_encode([
    'monthly_spend' => $totals,
    'monthly_ride_count' => $rideCounts,
    'average_per_trip' => $averagePerTrip,
    'average_per_location' => $averagePerLocation,
    'location_spend' => $locationSpend,
    'most_frequent_route' => $mostFrequentRoute
]);
?>