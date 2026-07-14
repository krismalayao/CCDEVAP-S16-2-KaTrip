<?php

session_start();

require "../../config/db.php";
require "../../backEnd/model/userSessionModel.php";
require "../../backEnd/model/adminDashModel.php";

header("Content-Type: application/json");

if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "admin") {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$data = getDashboardStats($conn);
echo json_encode($data);
