<?php


function getDashboardStats($conn) {
    return [
        "stats"          => getOverviewStats($conn),
        "tripsThisWeek"  => getTripsThisWeek($conn),
        "userBreakdown"  => getUserBreakdown($conn),
        "tripsOverTime"  => getTripsOverTime($conn),
        "tripStatus"     => getTripStatusBreakdown($conn)];
}

function getOverviewStats($conn) {
    $passengers = $conn->query(
        "SELECT COUNT(*) AS c FROM users WHERE role = 'passenger'")->fetch_assoc()['c'];

    $drivers = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'verified'")->fetch_assoc()['c'];

    $pending = $conn->query(
        "SELECT COUNT(*) AS c FROM driver_profiles WHERE verification_status = 'pending'")->fetch_assoc()['c'];

    $today     = date('Y-m-d');
    $todayName = date('l'); //ex. monday

    $sql = "SELECT COUNT(*) AS c
            FROM rides r
            JOIN ride_schedules rs ON r.schedule_id = rs.schedule_id
            WHERE r.ride_status IN ('scheduled', 'ongoing')
            AND (
                (rs.is_recurring = 0 AND rs.start_date = ?)
                OR
                (rs.is_recurring = 1 AND FIND_IN_SET(?, rs.days_of_week) AND ? BETWEEN rs.start_date AND rs.end_date)
                )";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $today, $todayName, $today);
    $stmt->execute();
    $tripsToday = $stmt->get_result()->fetch_assoc()['c'];

    return [
        "passengers" => (int) $passengers,
        "drivers"    => (int) $drivers,
        "pending"    => (int) $pending,
        "tripsToday" => (int) $tripsToday,
    ];
}

function getTripsThisWeek($conn) {
    $dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $labels   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    $monday = date('Y-m-d', strtotime('monday this week'));

    $result = [];
    foreach ($dayNames as $i => $dayName) {
        $date = date('Y-m-d', strtotime($monday . " +$i days"));

        $sql = "SELECT COUNT(*) AS c
                FROM rides r
                JOIN ride_schedules rs ON r.schedule_id = rs.schedule_id
                WHERE (rs.is_recurring = 0 AND rs.start_date = ?)
                OR (rs.is_recurring = 1 AND FIND_IN_SET(?, rs.days_of_week) AND ? BETWEEN rs.start_date AND rs.end_date)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $date, $dayName, $date);
        $stmt->execute();
        $count = $stmt->get_result()->fetch_assoc()['c'];

        $result[$labels[$i]] = (int) $count;
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
    //past 6 months
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
        $months[] = date('Y-m', strtotime("-$i months"));
    }

    $result = [];
    foreach ($months as $ym) {
        $sql = "SELECT COUNT(*) AS c
                FROM rides r
                JOIN ride_schedules rs ON r.schedule_id = rs.schedule_id
                WHERE r.ride_status = 'completed'
                AND DATE_FORMAT(rs.start_date, '%Y-%m') = ?";
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