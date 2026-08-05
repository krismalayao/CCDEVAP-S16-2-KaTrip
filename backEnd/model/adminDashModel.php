<?php


function getDashboardStats($conn) {
    return [
        "stats"             => getOverviewStats($conn),
        "tripsThisWeek"     => getTripsThisWeek($conn),
        "userBreakdown"     => getUserBreakdown($conn),
        "tripsOverTime"     => getTripsOverTime($conn),
        "tripStatus"        => getTripStatusBreakdown($conn),
        "revenueOverTime"   => getRevenueOverTime($conn),
        "cancellationRate"  => getCancellationRate($conn),
        "driverUtilization" => getDriverUtilization($conn),
        "peakHours"         => getPeakHours($conn),
    ];
}

function getOverviewStats($conn) {
    $passengers = $conn->query(
        "SELECT COUNT(*) AS c FROM users WHERE role = 'passenger'")->fetch_assoc()['c'];

    $drivers = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'verified'")->fetch_assoc()['c'];

    $pending = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'pending'")->fetch_assoc()['c'];

    // NOTE: every row in `rides` already carries its own concrete
    // departure_date, regardless of whether it originated from a
    // recurring ride_schedules template or a direct one-off booking.
    // Rides created via the direct-booking flow have schedule_id = NULL,
    // so joining against ride_schedules silently excludes them. Filtering
    // on rides.departure_date directly avoids that and is simpler.
    $today = date('Y-m-d');

    $sql = "SELECT COUNT(*) AS c
            FROM rides
            WHERE ride_status IN ('scheduled', 'ongoing')
            AND departure_date = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $tripsToday = $stmt->get_result()->fetch_assoc()['c'];

    // Revenue this month, based on completed transactions.
    // NOTE: transactions has no timestamp column, so we use the linked
    // booking's created_at as the closest available date proxy.
    $currentMonth = date('Y-m');
    $sql = "SELECT COALESCE(SUM(t.amount), 0) AS total
            FROM transactions t
            JOIN bookings b ON t.booking_id = b.booking_id
            WHERE t.payment_status = 'completed'
            AND DATE_FORMAT(b.created_at, '%Y-%m') = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $currentMonth);
    $stmt->execute();
    $revenueThisMonth = $stmt->get_result()->fetch_assoc()['total'];

    return [
        "passengers"       => (int) $passengers,
        "drivers"          => (int) $drivers,
        "pending"          => (int) $pending,
        "tripsToday"       => (int) $tripsToday,
        "revenueThisMonth" => (float) $revenueThisMonth,
    ];
}

function getTripsThisWeek($conn) {
    // Filters on rides.departure_date directly — see note in
    // getOverviewStats() about why joining ride_schedules excludes
    // direct-booked rides (schedule_id IS NULL).
    $labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    $monday = date('Y-m-d', strtotime('monday this week'));

    $result = [];
    foreach ($labels as $i => $label) {
        $date = date('Y-m-d', strtotime($monday . " +$i days"));

        $sql = "SELECT COUNT(*) AS c FROM rides WHERE departure_date = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $date);
        $stmt->execute();
        $count = $stmt->get_result()->fetch_assoc()['c'];

        $result[$label] = (int) $count;
    }

    return $result;
}

function getUserBreakdown($conn) {
    $passengers = $conn->query(
        "SELECT COUNT(*) AS c FROM users WHERE role = 'passenger'")->fetch_assoc()['c'];

    $drivers = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'verified'")->fetch_assoc()['c'];

    $pending = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'pending'")->fetch_assoc()['c'];

    $total = $passengers + $drivers + $pending;
    if ($total === 0) {
        return ["passengers" => 0, "drivers" => 0, "pending" => 0];
    }

    return [
        "passengers" => (int) round(($passengers / $total) * 100),
        "drivers"    => (int) round(($drivers / $total) * 100),
        "pending"    => (int) round(($pending / $total) * 100),
    ];
}

function getTripsOverTime($conn) {
    // Filters on rides.departure_date directly — see note in
    // getOverviewStats() about why joining ride_schedules excludes
    // direct-booked rides (schedule_id IS NULL).
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
        $months[] = date('Y-m', strtotime("-$i months"));
    }

    $result = [];
    foreach ($months as $ym) {
        $sql = "SELECT COUNT(*) AS c
                FROM rides
                WHERE ride_status = 'completed'
                AND DATE_FORMAT(departure_date, '%Y-%m') = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $ym);
        $stmt->execute();
        $count = $stmt->get_result()->fetch_assoc()['c'];

        $label = date('M', strtotime($ym . '-01'));
        $result[$label] = (int) $count;
    }

    return $result;
}

function getTripStatusBreakdown($conn) {
    $statuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    $result = [];

    foreach ($statuses as $status) {
        $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM rides WHERE ride_status = ?");
        $stmt->bind_param("s", $status);
        $stmt->execute();
        $count = $stmt->get_result()->fetch_assoc()['c'];
        $result[$status] = (int) $count;
    }

    return $result;
}

/**
 * Revenue over the past 6 months, from completed transactions.
 * NOTE: `transactions` has no date column, so this uses the linked
 * booking's created_at as the closest available date proxy.
 */
function getRevenueOverTime($conn) {
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
        $months[] = date('Y-m', strtotime("-$i months"));
    }

    $result = [];
    foreach ($months as $ym) {
        $sql = "SELECT COALESCE(SUM(t.amount), 0) AS total
                FROM transactions t
                JOIN bookings b ON t.booking_id = b.booking_id
                WHERE t.payment_status = 'completed'
                AND DATE_FORMAT(b.created_at, '%Y-%m') = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $ym);
        $stmt->execute();
        $total = $stmt->get_result()->fetch_assoc()['total'];

        $label = date('M', strtotime($ym . '-01'));
        $result[$label] = (float) $total;
    }

    return $result;
}

/**
 * Monthly cancellation rate (% of rides that were cancelled), past 6 months.
 * Based on rides.departure_date.
 */
function getCancellationRate($conn) {
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
        $months[] = date('Y-m', strtotime("-$i months"));
    }

    $result = [];
    foreach ($months as $ym) {
        $sql = "SELECT
                    SUM(CASE WHEN ride_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
                    COUNT(*) AS total
                FROM rides
                WHERE DATE_FORMAT(departure_date, '%Y-%m') = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $ym);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        $rate = $row['total'] > 0 ? round(($row['cancelled'] / $row['total']) * 100, 1) : 0;
        $label = date('M', strtotime($ym . '-01'));
        $result[$label] = (float) $rate;
    }

    return $result;
}

/**
 * Driver utilization proxy: % of verified drivers who have at least one
 * scheduled/ongoing/completed ride this month. There is no live/online
 * status tracked in the schema, so this measures "active this month"
 * rather than real-time availability.
 */
function getDriverUtilization($conn) {
    $totalVerified = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'verified'")->fetch_assoc()['c'];

    $currentMonth = date('Y-m');
    $sql = "SELECT COUNT(DISTINCT driver_id) AS c
            FROM rides
            WHERE DATE_FORMAT(departure_date, '%Y-%m') = ?
            AND ride_status IN ('scheduled', 'ongoing', 'completed')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $currentMonth);
    $stmt->execute();
    $activeDrivers = $stmt->get_result()->fetch_assoc()['c'];

    return [
        "activeDrivers"   => (int) $activeDrivers,
        "totalVerified"   => (int) $totalVerified,
        "utilizationRate" => $totalVerified > 0 ? round(($activeDrivers / $totalVerified) * 100, 1) : 0,
    ];
}

/**
 * Trip volume bucketed by time-of-day, based on rides.departure.
 * Includes scheduled/ongoing/completed rides (excludes cancelled,
 * since those never actually ran).
 */
function getPeakHours($conn) {
    $buckets = [
        '12–3am' => [0, 1, 2],
        '3–6am'  => [3, 4, 5],
        '6–9am'  => [6, 7, 8],
        '9–12pm' => [9, 10, 11],
        '12–3pm' => [12, 13, 14],
        '3–6pm'  => [15, 16, 17],
        '6–9pm'  => [18, 19, 20],
        '9–12am' => [21, 22, 23],
    ];

    $sql = "SELECT HOUR(STR_TO_DATE(departure, '%H:%i:%s')) AS hr, COUNT(*) AS c
            FROM rides
            WHERE ride_status IN ('scheduled', 'ongoing', 'completed')
            GROUP BY hr";
    $res = $conn->query($sql);

    $hourCounts = array_fill(0, 24, 0);
    while ($row = $res->fetch_assoc()) {
        if ($row['hr'] !== null) {
            $hourCounts[(int) $row['hr']] = (int) $row['c'];
        }
    }

    $result = [];
    foreach ($buckets as $label => $hours) {
        $sum = 0;
        foreach ($hours as $h) {
            $sum += $hourCounts[$h];
        }
        $result[$label] = $sum;
    }

    return $result;
}