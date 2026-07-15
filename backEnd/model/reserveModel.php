<?php
require_once "../../config/db.php";

function createBooking($ride_id, $passenger_id) {
    global $conn;

    $conn->begin_transaction();

    try {
        $checkSeats = $conn->prepare("
            SELECT available_seats 
            FROM rides 
            WHERE ride_id = ? 
            FOR UPDATE
        ");
        $checkSeats->bind_param("i", $ride_id);
        $checkSeats->execute();
        $seatResult = $checkSeats->get_result();

        if ($seatResult->num_rows === 0) {
            throw new Exception("Ride not found");
        }

        $ride = $seatResult->fetch_assoc();

        if ($ride['available_seats'] <= 0) {
            throw new Exception("No seats available");
        }

        $existingBooking = $conn->prepare("
            SELECT booking_id
            FROM bookings
            WHERE ride_id = ?
            AND passenger_id = ?
            AND booking_status IN ('pending', 'accepted')
            LIMIT 1
        ");
        $existingBooking->bind_param("ii", $ride_id, $passenger_id);
        $existingBooking->execute();
        $existingResult = $existingBooking->get_result();

        if ($existingResult->num_rows > 0) {
            throw new Exception("You already have an active reservation for this ride");
        }

        $insert = $conn->prepare("
            INSERT INTO bookings (ride_id, passenger_id, seat_reserved, booking_status)
            VALUES (?, ?, 1, 'pending')
        ");
        $insert->bind_param("ii", $ride_id, $passenger_id);
        $insert->execute();

        $booking_id = $conn->insert_id;

        $update = $conn->prepare("
            UPDATE rides 
            SET available_seats = available_seats - 1
            WHERE ride_id = ?
        ");
        $update->bind_param("i", $ride_id);
        $update->execute();

        $conn->commit();

        return [
            "success" => true,
            "booking_id" => $booking_id
        ];

    } catch (Exception $e) {
        $conn->rollback();

        return [
            "success" => false,
            "message" => $e->getMessage()
        ];
    }
}
?>
