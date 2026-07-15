<?php

function getBookingsPerMonth($conn, $user_id) 
{

    $sql = "
        SELECT 
            MONTH(b.created_at) AS month,
            COUNT(DISTINCT b.booking_id) AS total
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        WHERE b.passenger_id = ?
        AND r.ride_status = 'completed'
        GROUP BY MONTH(b.created_at)
        ORDER BY MONTH(b.created_at)
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
    LIMIT 3";

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

?>
