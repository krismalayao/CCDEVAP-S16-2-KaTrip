<?php

function getAvailableRides($conn)
{
    $sql = "
        SELECT
            r.ride_id,
            r.origin,
            r.origin_name,
            r.destination,
            r.destination_name,
            r.cost,
            r.available_seats,
            r.total_seats,
            r.ride_status,
            r.departure,
            r.departure_date,
            (
                SELECT GROUP_CONCAT(rl.landmark_name ORDER BY rl.landmark_number SEPARATOR ' | ')
                FROM ride_landmarks rl
                WHERE rl.ride_id = r.ride_id
            ) AS pickup_points,
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
