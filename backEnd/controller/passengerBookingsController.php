<?php
session_start();
require "../../config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['email']) || $_SESSION['role'] !== 'passenger') {
http_response_code(403);
echo json_encode(["error" => "Unauthorized"]);
exit();
}

$sql = "SELECT b.booking_id, b.booking_status, b.seat_reserved, r.ride_id, 
        r.origin, r.destination, r.departure, r.departure_date, 
        r.ride_status, r.cost,
        CASE WHEN d.show_full_name = 1 THEN u.first_name ELSE CONCAT(UPPER(LEFT(u.first_name, 1)), '.') END AS driver_first_name,
        CASE WHEN d.show_full_name = 1 THEN u.last_name ELSE CONCAT(UPPER(LEFT(u.last_name, 1)), '.') END AS driver_last_name,
        d.vehicle_model, d.plate_number
        FROM bookings b 
        JOIN rides r ON r.ride_id = b.ride_id
        LEFT JOIN driver_profiles d ON d.driver_id = r.driver_id
        LEFT JOIN users u ON u.user_id = r.driver_id
        WHERE b.passenger_id = ? 
        ORDER BY COALESCE(r.departure_date, '9999-12-31') DESC, r.departure DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $_SESSION['user_id']);
$stmt->execute();

$data = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$formatRow = function ($row) {
$row['booking_id']    = (int)$row['booking_id'];
$row['ride_id']       = (int)$row['ride_id'];
$row['seat_reserved'] = (int)$row['seat_reserved'];
$row['cost']          = (float)$row['cost'];
return $row;
};

echo json_encode(array_map($formatRow, $data));
?>