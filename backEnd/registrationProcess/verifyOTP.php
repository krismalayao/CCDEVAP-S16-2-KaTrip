<?php
    session_start();
    header("Content-Type: application/json");
    require "../../config/db.php";

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
            require "../../config/db.php";

            $stmt = $conn->prepare("INSERT INTO users(first_name, last_name, gender, birthdate,
                                    phone_number, email, role, status, password)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->bind_param("sssssssss", $sessionData['first_name'], $sessionData['last_name'],
                                $sessionData['gender'], $sessionData['birthdate'], $sessionData['phone_number'],
                                $sessionData['email'], $sessionData['role'], $sessionData['status'], $sessionData['password']);

            if (!$stmt->execute()) {
                echo json_encode(["status" => "error", "message" => "Failed to create account."]);
                exit;
            }
            unset($_SESSION['temp_user']);

            echo json_encode(["status" => "success", "message" => "Account successfully verified! Please login."]);
        exit;
        }
    }
?>