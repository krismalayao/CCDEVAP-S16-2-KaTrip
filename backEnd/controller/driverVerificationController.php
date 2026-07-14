<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/driverVerificationModel.php";

    if (isset($_POST["action"])) {
        $action = $_POST["action"];

        if ($action == "addDriverApplication") {
            
            // For Users
            $firstName = $_POST["first_name"];
            $lastName = $_POST["last_name"];
            $gender = $_POST["gender"];
            $birthdate = $_POST["birthdate"];
            $phoneNumber = $_POST["phone_number"];
            $email = $_POST["email"];

            // For Driver Profile
            $licenseNumber = $_POST["license_number"];
            $vehicleModel = $_POST["vehicle_model"];
            $plateNumber = $_POST["plate_number"];
            $vehicleColor = $_POST["vehicle_color"];

            $verificationStatus = $_POST["verification_status"];
            if ($verificationStatus == "verified") {
                $status = "active";
            } elseif ($verificationStatus == "denied") {
                $status = "denied";
            } else {
                $status = "pending";
            }

            $result = addDriverApplication($conn, $firstName, $lastName, $gender, $birthdate, $phoneNumber, $email, $licenseNumber, $vehicleModel, $plateNumber, $vehicleColor, $status,  $verificationStatus);
            if ($result) {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=successfulAdd");
            } else {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=duplicateAdd");
            }

            exit();
        } elseif($action == "editDriverApplication"){
            $driverId = $_POST["driver_id"];

            $firstName = $_POST["first_name"];
            $lastName = $_POST["last_name"];
            $gender = $_POST["gender"];
            $birthdate = $_POST["birthdate"];
            $phoneNumber = $_POST["phone_number"];
            $email = $_POST["email"];

            $licenseNumber = $_POST["license_number"];
            $vehicleModel = $_POST["vehicle_model"];
            $plateNumber = $_POST["plate_number"];
            $vehicleColor = $_POST["vehicle_color"];

            $verificationStatus = $_POST["verification_status"];

            $result = editDriverApplication($conn, $driverId, $firstName, $lastName, $gender, $birthdate, $phoneNumber, $email, $licenseNumber, $vehicleModel, $plateNumber, $vehicleColor, $verificationStatus);
            if ($result) {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=successfulEdit");
            } else {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=duplicateEdit");
            }

            exit();
        } elseif($action == "approveDriver") {
            $driverId = $_POST["driver_id"];
            $result = approveDriver($conn, $driverId);

            if ($result) {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=successfulApprove");                
            } else {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=failedApprove");
            }

            exit();
        } elseif($action == "denyDriver") {
            $driverId = $_POST["driver_id"];
            $result = denyDriver($conn, $driverId);
            
            if ($result) {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=successfulDeny");
            } else {
                header("Location: ../../frontEnd/admin/driverVerification.php?message=failedDeny");
            }

            exit();
        } elseif($action == "deleteDriverApplication") {
            $driverIds = json_decode($_POST["driver_ids"]);
            
            foreach ($driverIds as $driver) {
                deleteDriverApplication($conn, $driver);
            }

            header("Location: ../../frontEnd/admin/driverVerification.php?message=successfulDelete");
            exit();
        }
    }

    $listOfApplicants = getAllDriverApps($conn);
?>