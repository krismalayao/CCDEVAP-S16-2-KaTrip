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
    <title>Browse Rides - KaTrip</title>
    <link rel="stylesheet" href="../style/style.css">
    <link rel="stylesheet" href="../style/navbar.css">
    <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
</head>
<body class="browserides-body">
    <div id="navbar-mount"></div>

    <div class="browserides-layout">
        <main class="browserides-main">
            <h2 class="browserides-heading">Available Rides</h2>

            <div class="browserides-card">

                <div class="browserides-filters">
                    <button class="browserides-filter-btn active" data-filter="destination">
                        <span class="filter-icon">
                            <img src="../src/images/marker-icon.png" class="filter-icon">
                        </span> Destination
                    </button>
                    <button class="browserides-filter-btn" data-filter="departure">
                        <span class="filter-icon">
                            <img src="../src/images/clock-icon.png" class="filter-icon">
                        </span> Departure Time
                    </button>
                    <button class="browserides-filter-btn" data-filter="pickup">
                        <span class="filter-icon">
                            <img src="../src/images/car-icon.png" class="filter-icon">
                        </span> Pickup Point
                    </button>
                </div>

                <div class="browserides-filter-panel" id="panel-destination">
                    <form class="browserides-form" id="destination-form">
                        <div class="browserides-input-wrapper">
                            <input class="browserides-input" id="destination-input" type="text" placeholder="Enter destination" autocomplete="off">
                            <div class="browserides-suggestions" id="destination-suggestions" aria-label="Destination suggestions"></div>
                        </div>
                    </form>
                </div>

                <div class="browserides-filter-panel hidden" id="panel-departure">
                    <p class="browserides-filter-hint">Showing earliest departures first</p>
                </div>

                <div class="browserides-filter-panel hidden" id="panel-pickup">
                    <form class="browserides-form" id="pickup-form">
                        <div class="browserides-input-wrapper">
                            <input class="browserides-input" id="pickup-input" type="text" placeholder="Enter pickup point" autocomplete="off">
                            <div class="browserides-suggestions" id="pickup-suggestions"></div>
                        </div>
                    </form>
                </div>

                <div class="browserides-ride-list" id="ride-list"></div>

            </div>

        </main>
    </div>

    <script src="../components/navbarPassenger.js"></script>
    <script src="../script/features.js"></script>
</body>
</html>
