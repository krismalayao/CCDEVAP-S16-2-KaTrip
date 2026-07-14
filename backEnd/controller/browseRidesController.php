<?php
session_start();

include "../../config/db.php";
include "../model/browseRidesModel.php";

header('Content-Type: application/json');

$rides = getAvailableRides($conn);

echo json_encode($rides);
?>