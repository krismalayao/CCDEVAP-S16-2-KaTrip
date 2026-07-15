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
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KaTrip - My Bookings</title>
  <link rel="stylesheet" href="../style/style.css"><link rel="stylesheet" href="../style/navbar.css">
  <link rel="stylesheet" href="../style/myBookings.css"><link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
</head>
<body class="passenger-bookings-body">
  <div id="navbar-mount"></div>
  <div class="bookings-layout"><main class="bookings-main"><div class="bookings-card">
    <h2 class="bookings-heading">My Bookings</h2>
    <div class="bookings-container">
      <div class="bookings-tabs">
        <button class="tab-btn active" data-tab="pending"><img src="../src/images/pending-icon.png" class="filter-icon" alt="">Pending</button>
        <button class="tab-btn" data-tab="approved"><img src="../src/images/approved-icon.png" class="filter-icon" alt="">Approved</button>
        <button class="tab-btn" data-tab="history"><img src="../src/images/history-icon.png" class="filter-icon" alt="">History</button>
      </div>
      <div class="bookings-content">
        <div class="tab-panel active" id="pending"><div class="empty-state">No pending bookings yet.</div></div>
        <div class="tab-panel" id="approved"><div class="empty-state">No approved bookings yet.</div></div>
        <div class="tab-panel" id="history"><div class="empty-state">No booking history yet.</div></div>
      </div>
    </div>
  </div></main></div>
  <script src="../components/navbarPassenger.js"></script>
  <script src="../components/bookings.js"></script>
</body>
</html>
