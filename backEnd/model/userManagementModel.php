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

    function addUser($conn, $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $role, $status) {
        $check = $conn->prepare("SELECT user_id FROM users WHERE email = ? OR phone_number = ?");
        $check->bind_param("ss", $email, $phone_number);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            return false; // Duplicate found
        }
    
        $pass = password_hash("katrip123", PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, gender, birthdate, phone_number, email, role, status, password)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssssss", $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $role, $status, $pass);
        return $stmt->execute();
    }

    function editUser($conn, $user_id, $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $role, $status) {
        $stmt = $conn->prepare("UPDATE users SET first_name = ?, last_name = ?, gender = ?, birthdate = ?,
                                    phone_number = ?, email = ?, role = ?, status = ?
                                WHERE user_id = ?");
        $stmt->bind_param("ssssssssi", $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $role, $status, $user_id);
        return $stmt->execute();
    }

    function deleteUser($conn, $user_id) {
        $stmt = $conn->prepare("DELETE FROM users
                                WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        return $stmt->execute();
    }
?>