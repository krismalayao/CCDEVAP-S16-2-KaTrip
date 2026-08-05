<?php
// Serves as the data access to populate the passenger dashboard chart

function getPassengerSpendPerMonth($conn, $user_id)
{

    $sql = "
        SELECT 
            MONTH(r.departure_date) AS month,
            COALESCE(SUM(r.cost), 0) AS total
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND b.booking_status = 'accepted'
        AND r.ride_status = 'completed'
        AND YEAR(r.departure_date) = YEAR(CURDATE())
        GROUP BY MONTH(r.departure_date)
        ORDER BY MONTH(r.departure_date)
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    return $data;
}

function getPassengerAveragePerTrip($conn, $user_id)
{
    $sql = "
        SELECT COALESCE(AVG(r.cost), 0) AS avg_per_trip
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND b.booking_status = 'accepted'
        AND r.ride_status = 'completed'
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return (float)($row['avg_per_trip'] ?? 0);
}

function getPassengerSpendByLocation($conn, $user_id, $limit = 5)
{
    $limit = max(1, (int)$limit);

    $sql = "
        SELECT 
            COALESCE(NULLIF(TRIM(r.destination_name), ''), r.destination) AS location,
            COALESCE(SUM(r.cost), 0) AS total_spent
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND b.booking_status = 'accepted'
        AND r.ride_status = 'completed'
        GROUP BY location
        ORDER BY total_spent DESC
        LIMIT $limit
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            'location' => $row['location'] ?: 'Unknown',
            'total_spent' => (float)$row['total_spent']
        ];
    }

    return $rows;
}

function getPassengerAveragePerLocation($conn, $user_id)
{
    $sql = "
        SELECT COALESCE(SUM(loc.location_total) / NULLIF(COUNT(*), 0), 0) AS avg_per_location
        FROM (
            SELECT COALESCE(SUM(r.cost), 0) AS location_total
            FROM bookings b
            JOIN rides r ON b.ride_id = r.ride_id
            WHERE b.passenger_id = ?
            AND b.booking_status = 'accepted'
            AND r.ride_status = 'completed'
            GROUP BY COALESCE(NULLIF(TRIM(r.destination_name), ''), r.destination)
        ) loc
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return (float)($row['avg_per_location'] ?? 0);
}

function getUpcomingRides($conn, $user_id) 
{

    $sql = "
    SELECT 
        r.ride_id,
        r.origin,
        r.origin_name,
        r.destination,
        r.destination_name,
        r.departure_date,
        r.departure,
        r.ride_status,
        b.seat_reserved,
        b.booking_status
    FROM bookings b
    JOIN rides r ON b.ride_id = r.ride_id
    WHERE b.passenger_id = ?
    AND b.booking_status = 'accepted'
    AND r.ride_status = 'scheduled'
    AND r.departure_date IS NOT NULL
    AND r.departure IS NOT NULL
    AND TIMESTAMP(r.departure_date, r.departure) >= NOW()
    ORDER BY TIMESTAMP(r.departure_date, r.departure) ASC
    LIMIT 1";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $rides = [];
    while ($row = $result->fetch_assoc()) 
    {
        $rides[] = $row;
    }

    return $rides;
}

function countUpcomingRides($conn, $user_id)
{
    $sql = "
        SELECT COUNT(*) AS total
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND b.booking_status = 'accepted'
        AND r.ride_status = 'scheduled'
        AND r.departure_date IS NOT NULL
        AND r.departure IS NOT NULL
        AND TIMESTAMP(r.departure_date, r.departure) >= NOW()
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return (int)($row['total'] ?? 0);
}

function getPassengerRidesPerMonth($conn, $user_id)
{
    $sql = "
        SELECT 
            MONTH(r.departure_date) AS month,
            COUNT(*) AS total
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND b.booking_status = 'accepted'
        AND r.ride_status = 'completed'
        AND YEAR(r.departure_date) = YEAR(CURDATE())
        GROUP BY MONTH(r.departure_date)
        ORDER BY MONTH(r.departure_date)
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    return $data;
}

function getPassengerMostFrequentRoute($conn, $user_id)
{
    $sql = "
        SELECT 
            COALESCE(NULLIF(TRIM(r.origin_name), ''), r.origin) AS origin_label,
            COALESCE(NULLIF(TRIM(r.destination_name), ''), r.destination) AS destination_label,
            COUNT(*) AS ride_count
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND b.booking_status = 'accepted'
        AND r.ride_status = 'completed'
        GROUP BY origin_label, destination_label
        ORDER BY ride_count DESC
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
        return null;
    }

    return [
        'origin' => $row['origin_label'] ?: 'Unknown',
        'destination' => $row['destination_label'] ?: 'Unknown',
        'ride_count' => (int)$row['ride_count']
    ];
}

?>
