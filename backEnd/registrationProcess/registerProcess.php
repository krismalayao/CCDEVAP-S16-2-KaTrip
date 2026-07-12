<?php
    header("Content-Type: application/json");

    require '../PHPMailer/Exception.php';
    require '../PHPMailer/SMTP.php';
    require '../PHPMailer/PHPMailer.php';

    // Import PHPMailer Files
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    use PHPMailer\PHPMailer\SMTP;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // The emailing process
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
        $phone = filter_var(trim($_POST['phone_number'] ?? ''), FILTER_DEFAULT);
        $firstName = filter_var(trim($_POST['first_name'] ?? ''), FILTER_DEFAULT);
        $lastName = filter_var(trim($_POST['last_name'] ?? ''), FILTER_DEFAULT);
        $gender = filter_var(trim($_POST['gender'] ?? ''), FILTER_DEFAULT);
        $birthdate = filter_var(trim($_POST['birthdate'] ?? ''), FILTER_DEFAULT);
        $role = isset($_POST['katrip_driver']) ? "driver" : "passenger";
        $status = "pending";
        $password = $_POST['password'] ?? '';
        
        // Quick validation check block
        if (empty($email) || empty($phone) || empty($firstName) || empty($lastName) || empty($password)) {
            echo json_encode(["status" => "error", "message" => "Please complete all fields."]);
            exit;
        }

        // Generate Random 6 Digit OTP
        $otpCode = (string)rand(100000, 999999);

        // Store registration profile variables securely inside session state arrays 
        // to write into the MySQL database AFTER they match the validation token string.
        $_SESSION['temp_user'] = [
            'email' => $email,
            'phone_number' => $phone,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'gender' => $gender,
            'birthdate' => $birthdate,
            'role' => $role,
            'status' => $status,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'otp' => $otpCode,
            'otp_expires' => time() + 300
        ];

        // Mailing in Gmail
        $mail = new PHPMailer(true);

        try {
            // SMTP Outgoing Google Service Target Parameters
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'katrip.ccdevap@gmail.com';
            $mail->Password   = 'tblh lfts wvxx myua';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('katrip.ccdevap@gmail.com', 'KaTrip');
            $mail->addAddress($email, $firstName . ' ' . $lastName);

            // Email to User
            $mail->isHTML(true);
            $mail->Subject = "Verify Your KaTrip Account";
            $mail->Body    = "
                <div style='width: 100%; display: flex; justify-content: center; padding: 20px 0;'>
                    <div style='font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; max-width: 500px; margin: 0 auto;'>
                        <h2 style='color: #6437a0; margin-top: 0;'>Hello, $firstName!</h2>
                        <p>Welcome to KaTrip. Use the one-time security code below to complete your registration:</p>
                        <div style='font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #2c3e50; padding: 15px; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px;'>$otpCode</div>
                        <p style='font-size: 11px; color: #95a5a6; margin-bottom: 0;'>The OTP will expire within 5 minutes. If you did not execute this setup process, please disregard this automated notification.</p>
                    </div>
                </div>
            ";

            $mail->send();
            echo json_encode(["status" => "otp_sent", "message" => "Verification code delivered successfully!"]);
            
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => "Mail delivery exception: " . $mail->ErrorInfo]);
        }
        exit;
    }
?>