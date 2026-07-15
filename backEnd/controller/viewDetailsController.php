<?php
// Handles the view details button display
session_start();

include "../model/viewDetailsModel.php";
include "../../config/db.php";

header('Content-Type: application/json');

// Error msg
if (!isset($_GET['ride_id'])) 
{
    echo json_encode([
        "success" => false,
        "message" => "No ride ID provided"
    ]);

    exit();
}

$ride_id = $_GET['ride_id'];

$data = getRideDetails($conn, $ride_id);

if ($data) {
    if (!(bool)$data['show_full_name']) {
        $data['first_name'] = strtoupper(substr($data['first_name'], 0, 1)) . '.';
        $data['last_name'] = strtoupper(substr($data['last_name'], 0, 1)) . '.';
    }
    unset($data['show_full_name']);
}

echo json_encode([
    "success" => true,
    "ride" => $data
]);

?>