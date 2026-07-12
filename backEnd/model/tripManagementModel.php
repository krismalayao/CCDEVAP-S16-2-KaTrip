<?php
    require "../../config/db.php";

    function getAllTrips($conn) {
        $stmt = $conn->query("SELECT r.ride_id, CONCAT(u.first_name, ' ', u.last_name) AS driver,
                                r.origin, r.destination, r.departure, CONCAT((r.total_seats - r.available_seats), '/', r.total_seats) AS seats,
                                r.ride_status
                              FROM rides AS r

                              JOIN driver_profiles AS d ON r.driver_id = d.driver_id
                              JOIN users AS u ON d.driver_id = u.user_id;");
        
        return $stmt->fetch_all(MYSQLI_ASSOC);
    }

    function getAllBookings($conn, $ride_id) {
        $stmt = $conn->prepare("SELECT b.booking_id, CONCAT(u.first_name, ' ', u.last_name) AS passenger,
                                b.seat_reserved, b.booking_status FROM bookings AS b
                                JOIN users AS u ON b.passenger_id = u.user_id
                                WHERE b.ride_id = ?;");
        $stmt->bind_param("i", $ride_id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    function updateTripStatus($conn, $ride_id, $ride_status) {
        $stmt = $conn->prepare("UPDATE rides
                                SET ride_status = ?
                                WHERE ride_id = ?");
        $stmt->bind_param("si", $ride_status, $ride_id);
        return $stmt->execute();
    }
?>