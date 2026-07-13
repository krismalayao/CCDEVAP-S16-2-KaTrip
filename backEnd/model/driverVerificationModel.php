<?php
    require "../../config/db.php";

    function getAllDriverApps($conn) {
        $stmt = $conn->query("SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                              u.status, u.created_at FROM users AS u
                              WHERE role = 'driver';");
        return $stmt->fetch_all(MYSQLI_ASSOC);
    }

    function getDriverAppDetails($conn, $driverId) {
        $stmt = $conn->query();
    }
?>