<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "passenger") {
        header("Location: ../public/loginPage.php");
        exit();
    }

    $userId = $_SESSION["user_id"];
    $user = getUserById($conn, $userId);

    if (!$user) {
        session_destroy();
        header("Location: ../public/loginPage.php");
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KaTrip - Passenger Dashboard</title>
    <link rel="stylesheet" href="../style/style.css">
    <link rel="stylesheet" href="../style/navbar.css">
    <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
</head>
<body class="passenger-dashboard-body">
    <div id="navbar-mount"></div>
    <div class="cta-heading">
        <h1>What do you want to do?</h1>
    </div>

    <div class="charts">
        <h4>Rides Per Month</h4>
    <canvas id="rides-chart"></canvas>
    </div>

    <div class="passenger-dashboard-card-actions">
        <a href="myBookings.html" class="passenger-dashboard-action-btn">
            <img src="../src/images/calendar-icon.png" class="passenger-dashboard-icon">
            <span class="passenger-dashboard-label">View Bookings</span>
        </a>

        <a href="browseRides.html" class="passenger-dashboard-action-btn">
            <img src="../src/images/map-icon.png" class="passenger-dashboard-icon">
            <span class="passenger-dashboard-label">Browse Rides</span>
        </a>
    </div>
        
    <div class="passenger-dashboard-upcoming-rides">
        <h3>Upcoming Rides</h3>

        <div class="passenger-ride-list">
        </div>

    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="../components/navbarPassenger.js"></script>
    <script src="../script/passengerDashboard.js"></script>
</body>
</html>
