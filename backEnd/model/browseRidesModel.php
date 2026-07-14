<?php

function getAvailableRides($conn)
{
    $sql = "
        SELECT
            r.ride_id,
            r.origin,
            r.destination,
            r.cost,
            r.available_seats,
            r.total_seats,
            r.ride_status,
            r.departure,
            rs.start_date,
            rs.departure_time
        FROM rides r
        LEFT JOIN ride_schedules rs
            ON r.schedule_id = rs.schedule_id
        WHERE r.ride_status = 'scheduled'
        AND r.available_seats != 0
        ORDER BY rs.start_date ASC, rs.departure_time ASC, r.departure ASC
    ";

    $result = mysqli_query($conn, $sql);
    $rides = [];

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $rides[] = $row;
        }
    }

    return $rides;
}

?>
