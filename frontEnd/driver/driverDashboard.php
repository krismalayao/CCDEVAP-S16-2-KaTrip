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
        <title>KaTrip - Driver</title>
        <link rel="stylesheet" href="../style/navbar.css">
        <link rel="stylesheet" href="../style/driverDashboard.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
    </head>
    <body>

    <div id="navbar-mount"></div>
    <script src="../components/navbar.js"></script>

        <div class="page">

        <div class="page-header">
            <h1 class="page-title">My Trips</h1>
            <a href="../driver/driverCreateTrip.php" class="new-trip-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            New Trip
            </a>
        </div>

        <!-- STATS -->
        <div class="stats-row">
            <div class="stat-card">
            <div class="stat-label">Total Trips</div>
            <div class="stat-value" id="stat-total">0</div>
            <div class="stat-sub">All time</div>
            </div>
            <div class="stat-card">
            <div class="stat-label">Completed</div>
            <div class="stat-value" id="stat-completed">0</div>
            <div class="stat-sub">Successfully done</div>
            </div>
            <div class="stat-card">
            <div class="stat-label">Total Earned</div>
            <div class="stat-value" id="stat-earned">PHP 0</div>
            <div class="stat-sub">From completed trips</div>
            </div>
        </div>

        <!-- SEARCH -->
        <div class="search-wrap">
            <input class="search-input" id="search-input" placeholder="Search by destination or date…" oninput="filterTrips()"/>
        </div>

    <!-- FILTER TABS -->
    <div class="filter-tabs">
        <button class="filter-tab active" onclick="setFilter('all', this)">All</button>
        <button class="filter-tab" onclick="setFilter('ongoing', this)">Ongoing</button>
        <button class="filter-tab" onclick="setFilter('upcoming', this)">Upcoming</button>
        <button class="filter-tab" onclick="setFilter('completed', this)">Completed</button>
        <button class="filter-tab" onclick="setFilter('cancelled', this)">Cancelled</button>
    </div>

    <!-- TRIP LIST -->
    <div id="trip-list"></div>

    </div>
    
    <!-- CANCEL MODAL -->
    <div style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:200;align-items:center;justify-content:center;" id="cancel-modal">
    <div style="background:#fff;border-radius:20px;padding:32px 28px;max-width:360px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
        <div style="font-size:2.2rem;margin-bottom:12px;">⚠️</div>
        <h2 style="font-size:1.1rem;color:#2d1a4e;font-weight:700;margin-bottom:8px;">Cancel this trip?</h2>
        <p style="font-size:0.87rem;color:#6b7280;margin-bottom:24px;line-height:1.5;">Passengers who booked this ride will be notified. This cannot be undone.</p>
        <div style="display:flex;gap:10px;">
        <button onclick="hideCancelModal()" style="flex:1;padding:12px;border:1.5px solid #e5e7eb;background:#fff;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#374151;font-weight:500;">Keep Trip</button>
        <button onclick="confirmCancel()" style="flex:1;padding:12px;background:#ef4444;border:none;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#fff;font-weight:700;">Cancel Trip</button>
        </div>

        <!-- TRIP LIST -->
        <div id="trip-list"></div>

        </div>

        <!-- CANCEL MODAL -->
        <div style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:200;align-items:center;justify-content:center;" id="cancel-modal">
        <div style="background:#fff;border-radius:20px;padding:32px 28px;max-width:360px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
            <div style="font-size:2.2rem;margin-bottom:12px;">⚠️</div>
            <h2 style="font-size:1.1rem;color:#2d1a4e;font-weight:700;margin-bottom:8px;">Cancel this trip?</h2>
            <p style="font-size:0.87rem;color:#6b7280;margin-bottom:24px;line-height:1.5;">Passengers who booked this ride will be notified. This cannot be undone.</p>
            <div style="display:flex;gap:10px;">
            <button onclick="hideCancelModal()" style="flex:1;padding:12px;border:1.5px solid #e5e7eb;background:#fff;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#374151;font-weight:500;">Keep Trip</button>
            <button onclick="confirmCancel()" style="flex:1;padding:12px;background:#ef4444;border:none;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#fff;font-weight:700;">Cancel Trip</button>
            </div>
        </div>
        </div>
    </div>

    <!-- VIEW SUMMARY MODAL -->
    <div style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:200;align-items:center;justify-content:center;" id="summary-modal">
    <div style="background:#fff;border-radius:20px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.18);overflow:hidden;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#7c3aed,#9854cb);padding:24px 28px;color:#fff;">
        <div style="font-size:0.75rem;font-weight:600;opacity:0.85;letter-spacing:0.03em;text-transform:uppercase;margin-bottom:6px;">Trip Summary</div>
        <div id="summary-route" style="font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:8px;"></div>
        <div id="summary-date" style="font-size:0.82rem;opacity:0.9;margin-top:4px;"></div>
        </div>

        <!-- Body -->
        <div style="padding:24px 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
            <div style="background:#f9fafb;border-radius:12px;padding:14px;">
            <div style="font-size:0.72rem;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:6px;">Passengers</div>
            <div id="summary-pax" style="font-size:1rem;font-weight:700;color:#2d1a4e;"></div>
            </div>
            <div style="background:#f9fafb;border-radius:12px;padding:14px;">
            <div style="font-size:0.72rem;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:6px;">Fare Collected</div>
            <div id="summary-fare" style="font-size:1rem;font-weight:700;color:#16a34a;"></div>
            </div>
        </div>

        <div style="font-size:0.72rem;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:8px;">Pickup Stops</div>
        <div id="summary-pickups" style="font-size:0.88rem;color:#374151;line-height:1.7;margin-bottom:24px;"></div>

        <button onclick="hideSummaryModal()" style="width:100%;padding:13px;border:none;background:#7c3aed;border-radius:10px;font-size:0.9rem;cursor:pointer;color:#fff;font-weight:700;">Close</button>
        </div>

    </div>
    </div>

    <script src="../script/driverDashboard.js"></script>
    </body>
</html>