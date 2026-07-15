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
    <title>KaTrip - Ongoing Trip</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet"/>
    <link rel="stylesheet" href="../style/driverOngoing.css"/>
    <link rel="stylesheet" href="../style/navbar.css"/>
    <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
</head>
<body>

<div id="navbar-mount"></div>
<script src="../components/navbar.js"></script>

    <div class="app">

    <!-- MAP -->
    <div class="map-wrapper">
        <div id="map"></div>

        <div class="trip-header">
        <div class="route-label">
            <i class='bx bx-map-pin'></i>
            <span id="trip-route-summary">Loading trip...</span>
        </div>
        <!-- <div class="fare">PHP 92.33</div> tentative fare display, will be updated in the future -->
        <div class="trip-status-badge"><div class="pulse-dot"></div> In Progress</div>
        </div>
    </div>

    <!-- PANEL -->
    <div class="panel" id="panel">
        <div class="expand-hint" onclick="toggleSheet()">▲ Show details</div>

        <!-- Driver + Route -->
        <div class="card">
        <div class="card-title">Trip Details</div>
        <div class="driver-row">
            <div class="avatar" id="driver-avatar">...</div>
            <div>
            <div class="driver-name" id="driver-name">Loading...</div>
            <div class="driver-sub" id="driver-sub"></div>
            </div>
        </div>
        <div class="route-list" id="route-list">
            <!-- rendered by JS -->
        </div>
        <div class="fare-block">
            <div class="fare-row"><span>Est. Travel Time</span><span id="travel-time">Calculating...</span></div>
            <div class="fare-row"><span>Fee Per Passenger</span><span id="fare-per-pax">PHP —</span></div>
            <div class="fare-row total"><span>Total Collected</span><span id="collected">PHP —</span></div>
        </div>
        </div>

        <!-- Passengers -->
        <div class="card">
        <div class="card-title">Passengers <span style="font-size:12px;font-weight:400;color:#888;" id="pax-count">(3 on board)</span></div>
        <div class="pax-grid" id="pax-grid">
            <!-- rendered by JS -->
        </div>
        </div>

        <!-- Next stop -->
        <div class="next-stop-card" id="next-stop-card">
        <div>
            <div class="next-stop-label"><i class='bx bx-navigation'></i> Next Stop</div>
            <div class="next-stop-name" id="next-stop-name">SM City Olongapo</div>
            <div class="next-stop-eta" id="next-stop-eta">~8 min away</div>
        </div>
        <button class="btn-arrived" onclick="markArrived()">
            <i class='bx bx-check'></i> Arrived
        </button>
        </div>

        <!-- End trip -->
        <div class="end-wrap">
        <button class="btn-end" onclick="openEndModal()">
            <i class='bx bx-flag'></i> End Trip
        </button>
        </div>
    </div>
    </div>

    <!-- END MODAL -->
    <div class="modal-backdrop" id="end-modal">
    <div class="modal">
        <div class="modal-icon"><i class='bx bx-flag'></i></div>
        <div class="modal-title">End Trip?</div>
        <p class="modal-body">Are you sure you want to end this trip?</p>
        <div class="modal-summary">
        <div class="ms-row"><span>Passengers</span><span>3</span></div>
        <div class="ms-row"><span>Stops completed</span><span id="modal-stops">1 / 4</span></div>
        <div class="ms-row total"><span>Total Collected</span><span>PHP 207.75</span></div>
        </div>
        <button class="btn-confirm-end" onclick="confirmEnd()">Yes, End Trip</button>
        <button class="btn-keep-going" onclick="closeEndModal()">Keep Going</button>
    </div>
    </div>

    <div id="toast"></div>

<script src="../script/driverOngoing.js"></script>
</body>
</html>
