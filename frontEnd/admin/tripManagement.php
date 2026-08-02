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
                <div class="management-filters">
                    <h3>FILTERS</h3>
                    <input type="text" id="searchInput" placeholder="Search Trip" onkeyup="searchTrips()">

                    <select id="statusFilter" onchange="filterByStatus()">
                        <option>All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <label for="fromDate" class="date">Date From:</label>
                    <input type="date" id="fromDate" onchange="filterDates()">

                    <label for="toDate" class="date">Date To:</label>
                    <input type="date" id="toDate" onchange="filterDates()">
                </div>
            </div>

            <div class="management-data">
                <div class="management-header">
                    <h2>Trip Management</h2>
                    
                    <div class="top-action-buttons">
                        <button class="add-user-button" onclick="openAddModal()">
                            <span class="icon">+</span>
                            <span class="text">Add Trip</span>
                        </button>

                        <button id="editButton" class="edit-user-button" onclick="openEditModal()" disabled>
                            <span class="icon">✎</span>
                            <span class="text">Edit Trip</span>
                        </button>

                        <button id="deleteButton" class="delete-user-button" onclick="deleteTrip()" disabled>
                            <span class="icon">🗑</span>
                            <span class="text">Delete Trip</span>
                        </button>
                    </div>
                </div>
                
                <div class="responsive-table">
                    <table id="tripTable">
                        <thead>
                            <tr>
                                <th class="center">TRIP ID</th>
                                <th>DRIVER</th>
                                <th>ORIGIN</th>
                                <th>DESTINATION</th>
                                <th class="center">DEPARTURE DATE</th>
                                <th class="center">COST</th>
                                <th class="center">SEATS</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php if (empty($listOfTrips)): ?>
                                <tr>
                                    <td colspan="8" class="center">No Trips Found.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach($listOfTrips as $trip): ?>
                                    <tr data-ride-id="<?= $trip["ride_id"] ?>"
                                        data-driver-id="<?= $trip["driver_id"] ?>"
                                        data-origin="<?= htmlspecialchars($trip["origin"]) ?>"
                                        data-destination="<?= htmlspecialchars($trip["destination"]) ?>"
                                        data-departure="<?= htmlspecialchars($trip["departure"]) ?>"
                                        data-departure-date="<?= $trip["departure_date"] ?>"
                                        data-total-seats="<?= $trip["total_seats"] ?>"
                                        data-available-seats="<?= $trip["available_seats"] ?>"
                                        data-cost="<?= $trip["cost"] ?>"
                                        data-status="<?= $trip["ride_status"] ?>"
                                        onclick="selectRow(this)">

                                        <td class="center"><?= $trip["ride_id"] ?></td>
                                        <td><?= htmlspecialchars($trip["driver_name"]) ?></td>
                                        <td><?= htmlspecialchars($trip["origin"]) ?></td>
                                        <td><?= htmlspecialchars($trip["destination"]) ?></td>
                                        <td class="center" data-date="<?= $trip["departure_date"] ?>">
                                            <?= date("M j, Y", strtotime($trip["departure_date"])) ?>
                                        </td>
                                        <td class="center">₱<?= number_format($trip["cost"], 2) ?></td>
                                        <td class="center"><?= ($trip["total_seats"] - $trip["available_seats"]) . "/" . $trip["total_seats"] ?></td>
                                        <td class="<?php if ($trip["ride_status"] == 'scheduled'): echo 'status-scheduled'; 
                                                        elseif($trip["ride_status"] == 'ongoing'): echo 'status-ongoing'; 
                                                        elseif($trip["ride_status"] == 'completed'): echo 'status-completed'; 
                                                        elseif($trip["ride_status"] == 'cancelled'): echo 'status-cancelled'; endif; ?>">
                                            <?= ucfirst($trip["ride_status"]) ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
                <div id="pagination"></div>
            </div>
        </div>

        <div class="modal" id="tripModal">
            <form action="../../backEnd/controller/tripManagementController.php" method="POST" class="modal-content" id="tripForm">
                <input type="hidden" name="action" value="addTrip" id="formAction">
                <input type="hidden" name="ride_id" id="ride_id">

                <h3 id="modalTitle">Add Trip</h3>

                <label for="driver_id">Driver ID</label>
                <input type="number" id="driver_id" name="driver_id" placeholder="e.g. 5" required>

                <label for="origin">Origin</label>
                <input type="text" id="origin" name="origin" placeholder="e.g. DLSU Taft" required>

                <label for="destination">Destination</label>
                <input type="text" id="destination" name="destination" placeholder="e.g. Makati CBD" required>

                <label for="departure_date">Departure Date</label>
                <input type="date" id="departure_date" name="departure_date" required>

                <label for="departure">Departure Time / Details</label>
                <input type="text" id="departure" name="departure" placeholder="e.g. 08:30 AM" required>

                <label for="total_seats">Total Seats</label>
                <input type="number" id="total_seats" name="total_seats" min="1" required>

                <label for="available_seats">Available Seats</label>
                <input type="number" id="available_seats" name="available_seats" min="0" required>

                <label for="cost">Cost (₱)</label>
                <input type="number" step="0.01" id="cost" name="cost" placeholder="0.00" required>

                <label for="ride_status">Status</label>
                <select id="ride_status" name="ride_status" required>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <div class="modal-buttons">
                    <button type="button" class="cancel-button" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="save-button">Save</button>
                </div>
            </form>
        </div>

        <div class="modal" id="confirmModal">
            <div class="modal-content">
                <h3 id="confirmTitle">Confirm Delete</h3>
                <p id="confirmMessage">Are you sure?</p>

                <div class="modal-buttons">
                    <button class="cancel-button" onclick="closeConfirmModal()">Cancel</button>
                    <button class="save-button" id="confirmYesBtn">Yes</button>
                </div>
            </div>
        </div>

        <script src="../components/navbarAdmin.js"></script>
        <script src="../script/tripManagement.js"></script>
    </body>
</html>