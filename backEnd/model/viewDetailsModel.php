<?php
// Serves as the data access to properly display ride details

function getRideDetails($conn, $ride_id, $passenger_id)
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

        rs.start_date,
        rs.departure_time,

        u.first_name,
        u.last_name,
        u.phone_number,
        dp.show_full_name,

        (
            SELECT GROUP_CONCAT(rl.landmark_name ORDER BY rl.landmark_number SEPARATOR ', ')
            FROM ride_landmarks rl
            WHERE rl.ride_id = r.ride_id
        ) AS pickup_points,

        dp.vehicle_model,
        dp.plate_number,

        b.seat_reserved,
        (r.cost / NULLIF(r.total_seats, 0)) * b.seat_reserved AS passenger_fare

    FROM rides r

    JOIN users u
        ON r.driver_id = u.user_id

    JOIN driver_profiles dp
        ON r.driver_id = dp.driver_id

    LEFT JOIN ride_schedules rs
        ON r.schedule_id = rs.schedule_id

    LEFT JOIN bookings b
        ON b.ride_id = r.ride_id
        AND b.passenger_id = ?
        AND b.booking_status IN ('pending', 'accepted')

    WHERE r.ride_id = ?
";

$stmt = mysqli_prepare($conn, $sql);

mysqli_stmt_bind_param($stmt, "ii", $passenger_id, $ride_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

return mysqli_fetch_assoc($result);

}

?>