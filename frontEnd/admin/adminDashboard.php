<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "admin") {
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
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin - Dashboard</title>
        <link rel="stylesheet" href="../style/adminDashboard.css" />
        <link rel="stylesheet" href="../style/navbarAdmin.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>

    <body>
        <div id="navbar-mount"></div>
        <script src="../components/navbarAdmin.js"></script>

        <div class="dashboard-container">
            <main class="main-content-container">
                
                <div class="topbar">
                    <div class="topbar-title-group">
                        <h1>Admin Dashboard</h1>
                        <p class="topbar-subtitle">System status overview and core metrics</p>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="label">Total Passengers</div>
                        <div class="value" id="metric-passengers">128</div>
                        <div class="sub">Registered users</div>
                    </div>

                    <div class="stat-card stat-card-green">
                        <div class="label">Total Drivers</div>
                        <div class="value" id="metric-drivers">34</div>
                        <div class="sub">Verified accounts only</div>
                    </div>

                    <div class="stat-card stat-card-yellow">
                        <div class="label">Pending Verifications</div>
                        <div class="value" id="metric-pending">7</div>
                        <div class="sub">Awaiting document review</div>
                    </div>

                    <div class="stat-card stat-card-red">
                        <div class="label">Total Trips Today</div>
                        <div class="value" id="metric-trips">21</div>
                        <div class="sub">Scheduled &amp; ongoing</div>
                    </div>
                </div>

                <div class="charts-row">
                    <div class="chart-card">
                        <h3>Trips This Week</h3>
                        <canvas id="chartTripsWeek"></canvas>
                    </div>

                    <div class="chart-card">
                        <h3>User Breakdown</h3>
                        <canvas id="chartUserBreakdown"></canvas>
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="chart-card chart-card-wide">
                        <h3>Trips Completed Over Time</h3>
                        <canvas id="chartTripsOverTime"></canvas>
                    </div>

                    <div class="chart-card">
                        <h3>Trip Status Breakdown</h3>
                        <canvas id="chartTripStatus"></canvas>
                    </div>
                </div>

                <div class="quick-actions-container">
                    <h2 class="quick-actions-heading">Quick Actions</h2>
                    <div class="quick-actions-button-group">
                        <a href="userManagement.html" class="action-btn btn-purple">User Management</a>
                        <a href="driverVerification.html" class="action-btn btn-yellow">Driver Verification</a>
                        <a href="../public/loginPage.html" class="action-btn btn-red">Secure Logout</a>
                    </div>
                </div>
            </main>
        </div>




        <script>

            fetch('../../backEnd/controller/adminDashController.php')
                .then(res => res.json())
                .then(data => {
            
                    document.getElementById('metric-passengers').textContent = data.stats.passengers;
                    document.getElementById('metric-drivers').textContent = data.stats.drivers;
                    document.getElementById('metric-pending').textContent = data.stats.pending;
                    document.getElementById('metric-trips').textContent = data.stats.tripsToday;

                    // Trips
                    new Chart(document.getElementById('chartTripsWeek'), {
                        type: 'bar',
                        data: {
                            labels: Object.keys(data.tripsThisWeek),
                            datasets: [{
                                label: 'Trips',
                                data: Object.values(data.tripsThisWeek),
                                backgroundColor: '#a855f7'
                            }]
                        },
                        options: {
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                        }
                    });

                    // Users
                    new Chart(document.getElementById('chartUserBreakdown'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Passengers', 'Drivers', 'Pending'],
                            datasets: [{
                                data: [
                                    data.userBreakdown.passengers,
                                    data.userBreakdown.drivers,
                                    data.userBreakdown.pending
                                ],
                                backgroundColor: ['#6a0dad', '#a855f7', '#d8b4fe']}]
                        }
                    });

                    // Trips Over Time
                    new Chart(document.getElementById('chartTripsOverTime'), {
                        type: 'bar',
                        data: {
                            labels: Object.keys(data.tripsOverTime),
                            datasets: [{
                                label: 'Completed Trips',
                                data: Object.values(data.tripsOverTime),
                                backgroundColor: '#6a0dad'
                            }]
                        },
                        options: {
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                        }
                    });

                    // Trip Status Breakdown
                    new Chart(document.getElementById('chartTripStatus'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
                            datasets: [{
                                data: [
                                    data.tripStatus.scheduled,
                                    data.tripStatus.ongoing,
                                    data.tripStatus.completed,
                                    data.tripStatus.cancelled
                                ],
                                backgroundColor: ['#6a0dad', '#a855f7', '#22c55e', '#ef4444']}]
                        }
                    });
                })
                .catch(err => console.error('Failed to load dashboard data:', err));

        </script>

    </body>
</html>