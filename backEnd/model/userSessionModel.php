<?php
    require "../../config/db.php";

    function getUserEmail($conn, $email) {
        $stmt = $conn->prepare("SELECT * FROM users
                                WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    function getUserById($conn, $id) {
        $stmt = $conn->prepare("SELECT * FROM users 
                                WHERE user_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }
?>