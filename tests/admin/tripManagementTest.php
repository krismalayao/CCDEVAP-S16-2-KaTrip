<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../backEnd/model/tripManagementModel.php";

class TripManagementTest extends TestCase {

    private $conn;

    // Properly establish database connection
    protected function setUp(): void {
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

    // Tests if admin can add a new trip
    public function testAdminAddTrip() {
        $result = addTrip(
            $this->conn,
            5,
            "Quezon City, Metro Manila",
            "Makati CBD, Metro Manila",
            "2026-08-20",
            "08:30:00",
            4,
            4,
            120,
            "scheduled"
        );

        $this->assertTrue($result);
    }

    // Tests if admin can edit an existing trip
    public function testAdminEditTrip() {
        $result = editTrip(
            $this->conn,
            20,
            5,
            "Quezon City, Metro Manila",
            "Makati City, Metro Manila",
            "2026-08-20",
            "09:00:00",
            4,
            3,
            120,
            "scheduled"
        );

        $this->assertTrue($result);
    }

    // Tests if admin can delete an existing trip
    public function testAdminDeleteTrip() {
        $result = deleteTrip(
            $this->conn,
            25
        );

        $this->assertTrue($result);
    }

    // Tests if admin can retrieve trips from the database
    public function testAdminGetTrips() {
        $result = getAllTrips(
            $this->conn,
            "Makati"
        );

        $this->assertIsArray($result);
    }
}