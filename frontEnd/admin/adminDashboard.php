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

                    <div class="stat-card stat-card-teal">
                        <div class="label">Revenue This Month</div>
                        <div class="value" id="metric-revenue">₱0</div>
                        <div class="sub">Completed transactions</div>
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="chart-card chart-card-wide">
                        <h3>Revenue Over Time</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartRevenue"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Cancellation Rate</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartCancellation"></canvas>
                        </div>
                    </div>
                </div>

                <div class="charts-row">
                    <div class="chart-card">
                        <h3>Trips This Week</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartTripsWeek"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Peak Hours</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartPeakHours"></canvas>
                        </div>
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="chart-card chart-card-wide">
                        <h3>Trips Completed Over Time</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartTripsOverTime"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>User Breakdown</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartUserBreakdown"></canvas>
                        </div>
                    </div>
                </div>

                <div class="charts-row">
                    <div class="chart-card">
                        <h3>Trip Status Breakdown</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartTripStatus"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Driver Utilization</h3>
                        <div class="chart-canvas-wrap">
                            <canvas id="chartDriverUtilization"></canvas>
                        </div>
                        <p class="chart-footnote" id="driver-utilization-footnote"></p>
                    </div>
                </div>

                <div class="quick-actions-container">
                    <div class="quick-actions-button-group">
                        <button type="button" class="action-btn btn-purple" id="admin-theme-toggle">Switch to Dark Mode</button>
                        <a href="../../backEnd/controller/logoutController.php" class="action-btn btn-red">Logout</a>
                    </div>
                </div>
            </main>
        </div>




        <script>
            const adminThemeToggle = document.getElementById('admin-theme-toggle');
            const isMobileViewport = () => window.matchMedia('(max-width: 700px)').matches;

            function applyAdminTheme(theme) {
                document.documentElement.dataset.theme = theme;
                localStorage.setItem('katrip-theme', theme);

                if (theme === 'dark') {
                    adminThemeToggle.textContent = 'Switch to Light Mode';
                } else {
                    adminThemeToggle.textContent = 'Switch to Dark Mode';
                }
            }

            function getChartTextColor() {
                if (document.documentElement.dataset.theme === 'dark') {
                    return '#f3eaf7';
                }
                return '#2f2635';
            }

            function getGridColor() {
                return 'rgba(220, 210, 225, 0.18)';
            }

            function formatCurrency(value) {
                return '₱' + Number(value).toLocaleString('en-PH', { maximumFractionDigits: 0 });
            }

            const savedTheme = localStorage.getItem('katrip-theme') || 'light';
            applyAdminTheme(savedTheme);
            if (typeof Chart !== 'undefined') {
                Chart.defaults.color = getChartTextColor();
            }

            adminThemeToggle.addEventListener('click', function () {
                let nextTheme = 'dark';
                if (document.documentElement.dataset.theme === 'dark') {
                    nextTheme = 'light';
                }

                applyAdminTheme(nextTheme);

                const themeData = new FormData();
                themeData.append('theme_only', '1');
                themeData.append('theme_preference', nextTheme);
                fetch('../../backEnd/controller/profileController.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: themeData
                }).catch(function () {});
            });

            fetch('../../backEnd/controller/adminDashController.php')
                .then(res => res.json())
                .then(data => {

                    document.getElementById('metric-passengers').textContent = data.stats.passengers;
                    document.getElementById('metric-drivers').textContent = data.stats.drivers;
                    document.getElementById('metric-pending').textContent = data.stats.pending;
                    document.getElementById('metric-trips').textContent = data.stats.tripsToday;
                    document.getElementById('metric-revenue').textContent = formatCurrency(data.stats.revenueThisMonth);

                    const textColor = getChartTextColor();
                    const gridColor = getGridColor();
                    const mobile = isMobileViewport();

                    // Revenue Over Time (line)
                    new Chart(document.getElementById('chartRevenue'), {
                        type: 'line',
                        data: {
                            labels: Object.keys(data.revenueOverTime),
                            datasets: [{
                                label: 'Revenue',
                                data: Object.values(data.revenueOverTime),
                                borderColor: '#6a0dad',
                                backgroundColor: 'rgba(106, 13, 173, 0.12)',
                                fill: true,
                                tension: 0.35,
                                pointBackgroundColor: '#6a0dad',
                                pointRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) => formatCurrency(ctx.parsed.y)
                                    }
                                }
                            },
                            scales: {
                                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                                y: {
                                    beginAtZero: true,
                                    ticks: { color: textColor, callback: (v) => formatCurrency(v) },
                                    grid: { color: gridColor }
                                }
                            }
                        }
                    });

                    // Cancellation Rate (line, %)
                    new Chart(document.getElementById('chartCancellation'), {
                        type: 'line',
                        data: {
                            labels: Object.keys(data.cancellationRate),
                            datasets: [{
                                label: 'Cancellation Rate',
                                data: Object.values(data.cancellationRate),
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                fill: true,
                                tension: 0.35,
                                pointBackgroundColor: '#ef4444',
                                pointRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) => ctx.parsed.y + '%'
                                    }
                                }
                            },
                            scales: {
                                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                                y: {
                                    beginAtZero: true,
                                    ticks: { color: textColor, callback: (v) => v + '%' },
                                    grid: { color: gridColor }
                                }
                            }
                        }
                    });

                    // Trips This Week (line)
                    new Chart(document.getElementById('chartTripsWeek'), {
                        type: 'line',
                        data: {
                            labels: Object.keys(data.tripsThisWeek),
                            datasets: [{
                                label: 'Trips',
                                data: Object.values(data.tripsThisWeek),
                                borderColor: '#a855f7',
                                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                                fill: true,
                                tension: 0.35,
                                pointBackgroundColor: '#a855f7',
                                pointRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                                y: { beginAtZero: true, ticks: { precision: 0, color: textColor }, grid: { color: gridColor } }
                            }
                        }
                    });

                    // Peak Hours (bar)
                    new Chart(document.getElementById('chartPeakHours'), {
                        type: 'bar',
                        data: {
                            labels: Object.keys(data.peakHours),
                            datasets: [{
                                label: 'Trips',
                                data: Object.values(data.peakHours),
                                backgroundColor: '#6a0dad',
                                borderRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: {
                                    ticks: {
                                        color: textColor,
                                        maxRotation: mobile ? 60 : 0,
                                        minRotation: mobile ? 60 : 0,
                                        autoSkip: false,
                                        font: { size: mobile ? 9 : 11 }
                                    },
                                    grid: { color: gridColor }
                                },
                                y: { beginAtZero: true, ticks: { precision: 0, color: textColor }, grid: { color: gridColor } }
                            }
                        }
                    });

                    // Trips Completed Over Time (line)
                    new Chart(document.getElementById('chartTripsOverTime'), {
                        type: 'line',
                        data: {
                            labels: Object.keys(data.tripsOverTime),
                            datasets: [{
                                label: 'Completed Trips',
                                data: Object.values(data.tripsOverTime),
                                borderColor: '#6a0dad',
                                backgroundColor: 'rgba(106, 13, 173, 0.12)',
                                fill: true,
                                tension: 0.35,
                                pointBackgroundColor: '#6a0dad',
                                pointRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                                y: { beginAtZero: true, ticks: { precision: 0, color: textColor }, grid: { color: gridColor } }
                            }
                        }
                    });

                    // User Breakdown (doughnut)
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
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: mobile ? 'bottom' : 'right',
                                    labels: { color: textColor }
                                }
                            }
                        }
                    });

                    // Trip Status Breakdown (horizontal bar — makes cancellations easier to spot than a doughnut slice)
                    new Chart(document.getElementById('chartTripStatus'), {
                        type: 'bar',
                        data: {
                            labels: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
                            datasets: [{
                                label: 'Trips',
                                data: [
                                    data.tripStatus.scheduled,
                                    data.tripStatus.ongoing,
                                    data.tripStatus.completed,
                                    data.tripStatus.cancelled
                                ],
                                backgroundColor: ['#6a0dad', '#a855f7', '#22c55e', '#ef4444'],
                                borderRadius: 4
                            }]
                        },
                        options: {
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { beginAtZero: true, ticks: { precision: 0, color: textColor }, grid: { color: gridColor } },
                                y: { ticks: { color: textColor }, grid: { display: false } }
                            }
                        }
                    });

                    // Driver Utilization (horizontal bar: active vs. total verified)
                    new Chart(document.getElementById('chartDriverUtilization'), {
                        type: 'bar',
                        data: {
                            labels: ['Active This Month', 'Total Verified'],
                            datasets: [{
                                label: 'Drivers',
                                data: [
                                    data.driverUtilization.activeDrivers,
                                    data.driverUtilization.totalVerified
                                ],
                                backgroundColor: ['#22c55e', '#d8b4fe'],
                                borderRadius: 4
                            }]
                        },
                        options: {
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { beginAtZero: true, ticks: { precision: 0, color: textColor }, grid: { color: gridColor } },
                                y: { ticks: { color: textColor }, grid: { display: false } }
                            }
                        }
                    });

                    document.getElementById('driver-utilization-footnote').textContent =
                        data.driverUtilization.utilizationRate + '% of verified drivers had a trip this month';
                })
                .catch(err => console.error('Failed to load dashboard data:', err));

        </script>

    </body>
</html>