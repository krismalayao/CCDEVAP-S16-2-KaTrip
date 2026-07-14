<?php
    session_start();
    require "../../backEnd/controller/tripManagementController.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "admin") {
        header("Location: ../public/loginPage.php"); 
        exit();
    }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="KaTrip Admin - Trip Management Page">
        <meta name="keywords" content="Admin Page, KaTrip, User">
        <meta name="author" content="Team 2">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin - Trip Management</title>
        <link rel="stylesheet" href="../style/tripManagement.css">
        <link rel="stylesheet" href="../style/navbarAdmin.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
    </head>

    <body class="management-body">
        <div id="navbar-mount"></div>

        <div class="management-container">
            <div class="management-features">

                <div class="management-actions">
                    <h3>ACTIONS</h3>

                    <button onclick="viewBookings()">View Bookings</button>
                    <button onclick="updateTripStatus()">Change Status</button>
                </div>

                <div class="management-filters">
                    <h3>FILTERS</h3>

                    <input type="text" id="searchInput" placeholder="Search Trip" onkeyup="searchTrips()">

                    <select id="statusFilter" onchange="filterByStatus()">
                        <option>All Status</option>
                        <option>Scheduled</option>
                        <option>Ongoing</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>

                    <label class="date">Time From:</label>
                    <input type="time" id="fromTime" onchange="filterTime()">

                    <label class="date">Time To:</label>
                    <input type="time" id="toTime" onchange="filterTime()">
                </div>
            </div>

            <div class="management-data">
                <h2>Trip Management</h2>

                <div class="responsive-table">
                    <table id="tripTable">
                        <thead>
                            <tr>
                                <th class="center">SELECT</th>
                                <th class="center">TRIP ID</th>
                                <th>DRIVER</th>
                                <th>ORIGIN</th>
                                <th>DESTINATION</th>
                                <th class="center">DEPARTURE TIME</th>
                                <th class="center">SEATS</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php if (empty($listOfTrips)): ?>
                                <tr>
                                    <td colspan="8">No Trips Were Made.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach($listOfTrips as $trip): ?>
                                    <tr data-time="<?= date("H:i", strtotime($trip["departure"])) ?>">
                                        <td class="center"><input type="radio" name="selectedTrip" value="<?= $trip["ride_id"] ?>"></td>
                                        <td class="center"><?= $trip["ride_id"] ?></td>
                                        <td><?= $trip["driver"] ?></td>
                                        <td><?= $trip["origin"] ?></td>
                                        <td><?= $trip["destination"] ?></td>
                                        <td class="center"><?= date("g:i A", strtotime($trip["departure"])) ?></td>
                                        <td class="center"><?= $trip["seats"] ?></td>
                                        <td class="<?php if ($trip["ride_status"] == 'scheduled'): echo 'status-scheduled'; 
                                                        elseif($trip["ride_status"] == 'ongoing'): echo 'status-ongoing'; 
                                                        elseif($trip["ride_status"] == 'completed'): echo 'status-completed'; 
                                                        elseif($trip["ride_status"] == 'cancelled'): echo 'status-cancelled'; endif; ?>">
                                                        <?= ucfirst($trip["ride_status"]) ?></td>
                                    </tr>
                                <?php endforeach ?>
                            <?php endif ?>
                        </tbody>
                    </table>
                </div>
                <div id="pagination"></div>
            </div>
        </div>
        
        <div class="modal" id="statusModal">
            <form action="../../backEnd/controller/tripManagementController.php" method="POST" class="modal-content">
                <input type="hidden" name="action" value="updateStatus">
                <input type="hidden" name="ride_id" id="selectedRideId">

                <h3>Update Trip Status</h3>

                <label>Status</label>

                <select name="ride_status" id="tripStatus">
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>


                <div class="modal-buttons">
                    <button type="button" 
                            class="cancel-button" 
                            onclick="closeModal()">
                        Cancel
                    </button>

                    <button type="submit" class="save-button">
                        Save
                    </button>
                </div>

            </form>
        </div>

        <div class="modal" id="reservationModal">
            <div class="modal-content">

                <h3>Trip Bookings</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Passenger</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody id="reservationBody"></tbody>
                </table>

                <div class="modal-buttons">
                    <button class="cancel-button" onclick="closeReservations()">
                        Close
                    </button>
                </div>

            </div>
        </div>

        <script src="../components/navbarAdmin.js"></script>
        <script src="../script/tripManagement.js"></script>
    </body>
</html>