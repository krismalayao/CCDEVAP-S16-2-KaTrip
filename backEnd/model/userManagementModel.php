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
?>