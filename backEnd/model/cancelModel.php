// Serves as the data layer for booking cancellation
<?php
require_once "../../config/db.php";

function cancelBooking($booking_id) {
    global $conn;

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            SELECT ride_id, booking_status 
            FROM bookings 
            WHERE booking_id = ?
            FOR UPDATE
        ");
        $stmt->bind_param("i", $booking_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception("Booking not found");
        }

        $booking = $result->fetch_assoc();

        if ($booking['booking_status'] === 'cancelled') {
            throw new Exception("Already cancelled");
        }

        $updateBooking = $conn->prepare("
            UPDATE bookings 
            SET booking_status = 'cancelled'
            WHERE booking_id = ?
        ");
        $updateBooking->bind_param("i", $booking_id);
        $updateBooking->execute();

        $updateRide = $conn->prepare("
            UPDATE rides 
            SET available_seats = available_seats + 1
            WHERE ride_id = ?
        ");
        $updateRide->bind_param("i", $booking['ride_id']);
        $updateRide->execute();

        $conn->commit();

        return ["success" => true];

    } catch (Exception $e) {
        $conn->rollback();

        return [
            "success" => false,
            "message" => $e->getMessage()
        ];
    }
}
?>
