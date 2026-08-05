<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../backEnd/model/tripModel.php";


class TripTest extends TestCase {

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

    // Tests if driver can create a new ride
    public function testDriverCreateRide() {

        $data = [
            "origin" => "Quezon City, Metro Manila",
            "destination" => "Makati CBD, Metro Manila",
            "departure_date" => "2026-08-20",
            "departure_time" => "08:30:00",
            "total_seats" => 4,
            "cost" => 120
        ];

        $result = createRide(
            $this->conn,
            5,
            $data
        );

        $this->assertIsInt($result);
    }

    // Tests if driver can retrieve their rides
    public function testDriverGetRides() {

        $result = getRidesByDriver(
            $this->conn,
            5
        );

        $this->assertIsArray($result);
    }

    // Tests if driver can retrieve ride details
    public function testDriverGetRideDetails() {

        $result = getRideById(
            $this->conn,
            3,
            5
        );

        $this->assertIsArray($result);
    }

    // Tests if driver can update ride status
    public function testDriverUpdateRideStatus() {

        $result = updateRideStatus(
            $this->conn,
            3,
            5,
            "scheduled"
        );

        $this->assertTrue($result);
    }

    // Tests if driver can update ride details
    public function testDriverUpdateRideDetails() {

        $data = [
            "origin" => "Makati",
            "destination" => "Ortigas",
            "departure_date" => "2026-07-10",
            "departure_time" => "17:30:00",
            "total_seats" => 4,
            "available_seats" => 4,
            "cost" => 120
        ];

        $result = updateRideDetails(
            $this->conn,
            3,
            5,
            $data
        );

        $this->assertTrue($result);
    }

    // Tests if driver can create ride landmarks
    public function testDriverCreateLandmarks() {

        $landmarks = [
            [
                "name" => "Cubao",
                "latitude" => 14.6195,
                "longitude" => 121.0567
            ]
        ];

        $result = createLandmarks(
            $this->conn,
            3,
            $landmarks
        );

        $this->assertTrue($result);
    }

    // Tests if driver can retrieve ride landmarks
    public function testDriverGetLandmarks() {

        $result = getLandmarksForRide(
            $this->conn,
            3
        );

        $this->assertIsArray($result);
    }

    // Tests if driver can replace ride landmarks
    public function testDriverReplaceLandmarks() {

        $result = replaceLandmarks(
            $this->conn,
            3,
            []
        );

        $this->assertTrue($result);
    }

    // Tests if driver can retrieve profile information
    public function testDriverGetProfile() {

        $result = getDriverProfile(
            $this->conn,
            5
        );

        $this->assertIsArray($result);
    }

    // Tests if ride status can be converted correctly
    public function testDriverMapRideStatus() {

        $result = mapRideStatusToGroup(
            "scheduled"
        );

        $this->assertNotEmpty($result);
    }

    // Tests if ride time can be formatted correctly
    public function testDriverFormatRideTime() {

        $result = formatRideTime(
            "17:30:00"
        );

        $this->assertNotEmpty($result);
    }

    // Tests if driver can retrieve pending bookings
    public function testDriverGetPendingBookings() {

        $result = getPendingBookingsByDriver(
            $this->conn,
            5
        );

        $this->assertIsArray($result);
    }

    // Tests if driver can retrieve monthly earnings
    public function testDriverGetMonthlyEarnings() {

        $result = getDriverEarningsByMonth(
            $this->conn,
            5
        );

        $this->assertIsArray($result);
    }

    // Tests if driver can retrieve earnings by destination
    public function testDriverGetEarningsByDestination() {

        $result = getDriverEarningsByDestination(
            $this->conn,
            5
        );

        $this->assertIsArray($result);
    }

}

?>