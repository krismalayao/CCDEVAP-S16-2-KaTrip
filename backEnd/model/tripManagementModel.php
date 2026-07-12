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

    function updateTripStatus($conn, $ride_id, $ride_status) {
        $stmt = $conn->prepare("UPDATE rides
                                SET ride_status = ?
                                WHERE ride_id = ?");
        $stmt->bind_param("si", $ride_status, $ride_id);
        return $stmt->execute();
    }
?>