<?php
    require_once __DIR__ . "/../../config/db.php";

    function getAllTrips($conn, $search) {
        if ($search == "") {
            $query = $conn->query("SELECT r.ride_id, r.driver_id, CONCAT(u.first_name, ' ', u.last_name) AS driver_name, 
                                   r.origin, r.destination, r.departure, r.departure_date, r.total_seats,
                                   r.available_seats, r.cost, r.ride_status
                                   FROM rides AS r
                                   JOIN users AS u ON r.driver_id = u.user_id
                                   ORDER BY r.ride_id DESC");
            return $query->fetch_all(MYSQLI_ASSOC);
        } else {
            $searchFilter = "%" . $search . "%";
            $stmt = $conn->prepare("SELECT r.ride_id, r.driver_id, CONCAT(u.first_name, ' ', u.last_name) AS driver_name,
                                    r.origin, r.destination, r.departure, r.departure_date, r.total_seats,
                                    r.available_seats, r.cost, r.ride_status
                                    FROM rides AS r
                                    JOIN users AS u ON r.driver_id = u.user_id
                                    WHERE u.first_name LIKE ?
                                       OR u.last_name LIKE ?
                                       OR r.origin LIKE ?
                                       OR r.destination LIKE ?
                                    ORDER BY r.ride_id DESC");
            $stmt->bind_param("ssss", $searchFilter, $searchFilter, $searchFilter, $searchFilter);
            $stmt->execute();
            $query = $stmt->get_result();
            return $query->fetch_all(MYSQLI_ASSOC);
        }
    }

    function addTrip($conn, $driver_id, $origin, $destination, $departure_date, $departure, $total_seats, $available_seats, $cost, $ride_status) {
        // Prevent exact schedule duplicates for the same driver on the same day/time
        $check = $conn->prepare("SELECT ride_id FROM rides WHERE driver_id = ? AND departure_date = ? AND departure = ?");
        $check->bind_param("iss", $driver_id, $departure_date, $departure);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            return false; // Duplicate found
        }

        $stmt = $conn->prepare("INSERT INTO rides (driver_id, origin, destination, departure_date, departure, total_seats, available_seats, cost, ride_status)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssidds", $driver_id, $origin, $destination, $departure_date, $departure, $total_seats, $available_seats, $cost, $ride_status);
        return $stmt->execute();
    }

    function editTrip($conn, $ride_id, $driver_id, $origin, $destination, $departure_date, $departure, $total_seats, $available_seats, $cost, $ride_status) {
        $check = $conn->prepare("SELECT ride_id FROM rides WHERE driver_id = ? AND departure_date = ? AND departure = ? AND ride_id != ?");
        $check->bind_param("issi", $driver_id, $departure_date, $departure, $ride_id);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            return false; // Conflict found with existing trip
        }

        $stmt = $conn->prepare("UPDATE rides SET driver_id = ?, origin = ?, destination = ?, departure_date = ?, departure = ?, total_seats = ?, available_seats = ?, cost = ?, ride_status = ?
                                WHERE ride_id = ?");
        $stmt->bind_param("issssiddsi", $driver_id, $origin, $destination, $departure_date, $departure, $total_seats, $available_seats, $cost, $ride_status, $ride_id);
        return $stmt->execute();
    }

    function deleteTrip($conn, $ride_id) {
        $stmt = $conn->prepare("DELETE FROM rides WHERE ride_id = ?");
        $stmt->bind_param("i", $ride_id);
        return $stmt->execute();
    }
?>