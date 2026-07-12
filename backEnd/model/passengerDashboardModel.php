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
        r.origin,
        r.destination,
        r.departure,
        r.ride_status,
        b.seat_reserved,
        b.booking_status,
        r.ride_id
    FROM bookings b
    JOIN rides r ON b.ride_id = r.ride_id
    WHERE b.passenger_id = ?
    AND r.ride_status = 'scheduled'
    ORDER BY r.departure ASC";

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

?>
