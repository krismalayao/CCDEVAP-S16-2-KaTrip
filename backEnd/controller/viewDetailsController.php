// Handles the view details button displays

<?php

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

echo json_encode([
    "success" => true,
    "ride" => $data
]);

?>
