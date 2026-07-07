<?php
    header("Content-Type: application/json");
    session_start();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $enteredCode = trim($_POST['otp_code'] ?? '');
        
        if (!isset($_SESSION['temp_user'])) {
            echo json_encode(["status" => "error", "message" => "Session expired. Please register again."]);
            exit;
        }

        $sessionData = $_SESSION['temp_user'];

        // Validate if the input code matches the session code and checking expiration timing values
        if (time() > $sessionData['otp_expires']) {
            unset($_SESSION['temp_user']);
            echo json_encode(["status" => "error", "message" => "The security code has expired."]);
            exit;
        }

        if ($enteredCode === $sessionData['otp']) {
            
            // ADD SQL STATEMENTS TO INPUT THE DATA INTO THE DATABASE

            // Clear out registration temporary data
            unset($_SESSION['temp_user']);

            echo json_encode(["status" => "success", "message" => "Account successfully verified! Please login."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid OTP."]);
        }
        exit;
    }
?>