<?php
    require "../../config/db.php";

    function getAllUsers($conn, $search) {
        if ($search == "") {
            $query = $conn->query("SELECT * FROM users");
            return $query->fetch_all(MYSQLI_ASSOC);

        } else {
            $searchFilter = "%" . $search . "%";
            $stmt = $conn->prepare("SELECT * FROM users
                                   WHERE first_name LIKE ?
                                   OR last_name LIKE ? 
                                   OR email LIKE ?");
            $stmt->bind_param("sss", $searchFilter, $searchFilter, $searchFilter);
            $stmt->execute();
            $query = $stmt->get_result();
            return $query->fetch_all(MYSQLI_ASSOC);
        }
    }

    function toggleUserStatus($conn, $user_id) {
        $stmt = $conn->prepare("UPDATE users SET status = 
                                CASE 
                                    WHEN status = 'active' THEN 'suspended'
                                    WHEN status = 'suspended' THEN 'active'
                                    ELSE status
                                END
                                WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        return $stmt->execute();
    }

    function approveUser($conn, $user_id) {
        $stmt = $conn->prepare("UPDATE users SET status = 'active'
                                WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        return $stmt->execute();
    }
?>