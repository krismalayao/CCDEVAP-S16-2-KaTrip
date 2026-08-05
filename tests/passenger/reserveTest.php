<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . "/../../backEnd/model/reserveModel.php";


class ReserveTest extends TestCase
{

    private $conn;


    // Properly establish database connection
    protected function setUp(): void
    {
        $this->conn = mysqli_connect(
            "localhost",
            "root",
            "",
            "katrip_db",
            3306
        );

        if (!$this->conn) {
            die("Database connection failed: " . mysqli_connect_error());
        }
    }


    // Tests if a passenger can reserve an available ride
    public function testReserveRide()
    {
        $result = createBooking(
            $this->conn,
            3,
            1
        );

        $this->assertTrue($result["success"]);
        $this->assertArrayHasKey("booking_id", $result);
    }


    // Tests if the system prevents reservation of a ride that does not exists
    public function testReserveInvalidRide()
    {
        $result = createBooking(
            $this->conn,
            999,
            1
        );

        $this->assertFalse($result["success"]);
        $this->assertEquals(
            "Ride not found",
            $result["message"]
        );
    }

    // Tests if a passenger cannot reserve the same ride multiple times
    public function testReserveDupeRide()
    {
        // Create new reservation
        createBooking(
            $this->conn,
            3,
            1
        );

        // Same booking reservation
        $result = createBooking(
            $this->conn,
            3,
            1
        );

        $this->assertFalse($result["success"]);
        $this->assertEquals(
            "You already have an active reservation for this ride",
            $result["message"]
        );
    }

}
?>