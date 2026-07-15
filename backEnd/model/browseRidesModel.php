<?php
// Serves as the data access for browse rides display, only shows rides that have not been booked and are not full.

function getAvailableRides($conn, $passengerId = null)
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
        AND r.available_seats > 0
    ";

    $params = [];
    $types = "";

    if ($passengerId !== null) {
        $sql .= "
            AND NOT EXISTS (
                SELECT 1
                FROM bookings b
                WHERE b.ride_id = r.ride_id
                AND b.passenger_id = ?
                AND b.booking_status IN ('pending', 'accepted')
            )
        ";
        $params[] = (int) $passengerId;
        $types .= "i";
    }

    $sql .= "
        ORDER BY rs.start_date ASC, rs.departure_time ASC, r.departure ASC
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return [];
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $rides = [];
    while ($row = $result->fetch_assoc()) {
        $rides[] = $row;
    }

    return $rides;
}

?>