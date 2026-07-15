<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        header("Location: ../public/loginPage.php");
        exit();
    }

    $userId = $_SESSION["user_id"];
    $user = getUserById($conn, $userId);

    if (!$user) {
        session_destroy();
        header("Location: ../public/loginPage.php");
        exit();
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KaTrip - Ride Requests</title>
    <link rel="stylesheet" href="../style/driverDashboard.css">
    <link rel="stylesheet" href="../style/navbar.css">
    <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
</head>
<body>

<div id="navbar-mount"></div>
<script src="../components/navbar.js"></script>

    <div class="page">
        <div class="page-header">
            <h1 class="page-title">Ride Requests</h1>
        </div>
        <div id="requests-list"></div>
    </div>

<script src="../script/driverRequests.js"></script>
</body>
</html>