<?php
session_start();

require "../../config/db.php";
require "../PHPMailer/Exception.php";
require "../PHPMailer/SMTP.php";
require "../PHPMailer/PHPMailer.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: application/json");

function securityResponse(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    securityResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
}

if (!isset($_SESSION['user_id'], $_SESSION['role'], $_SESSION['email'])) {
    securityResponse(401, ['success' => false, 'message' => 'Please log in again.']);
}

$userId = (int)$_SESSION['user_id'];
$action = $_POST['action'] ?? '';

$accountQuery = $conn->prepare('SELECT email, first_name, password FROM users WHERE user_id = ? LIMIT 1');
$accountQuery->bind_param('i', $userId);
$accountQuery->execute();
$account = $accountQuery->get_result()->fetch_assoc();

if (!$account) {
    securityResponse(404, ['success' => false, 'message' => 'Account not found.']);
}

$_SESSION['email'] = $account['email'];

if ($action === 'request_email_otp') {
    $currentEmail = strtolower(trim($account['email']));
    $email = strtolower(trim($_POST['email'] ?? ''));
    $confirmEmail = strtolower(trim($_POST['confirm_email'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        securityResponse(422, ['success' => false, 'message' => 'Enter a valid email address.']);
    }
    if ($email !== $confirmEmail) {
        securityResponse(422, ['success' => false, 'message' => 'The email addresses do not match.']);
    }
    if ($email === $currentEmail) {
        securityResponse(422, ['success' => false, 'message' => 'Enter an email different from your current email.']);
    }

    $check = $conn->prepare('SELECT user_id FROM users WHERE email = ? AND user_id != ? LIMIT 1');
    $check->bind_param('si', $email, $userId);
    $check->execute();
    if ($check->get_result()->fetch_assoc()) {
        securityResponse(409, ['success' => false, 'message' => 'That email is already in use.']);
    }

    $otp = (string)random_int(100000, 999999);
    $firstName = $account['first_name'] ?: 'KaTrip user';

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = getenv('KATRIP_SMTP_USERNAME') ?: 'katrip.ccdevap@gmail.com';
        $mail->Password = getenv('KATRIP_SMTP_PASSWORD') ?: 'tblh lfts wvxx myua';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->setFrom($mail->Username, 'KaTrip');
        $mail->addAddress($email, $firstName);
        $mail->isHTML(true);
        $mail->Subject = 'Verify your new KaTrip email';
        $mail->Body = "<div style='font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0'>"
            . "<h2 style='color:#6437a0'>Confirm your new email</h2>"
            . "<p>Use this one-time code to confirm the email change for your KaTrip account:</p>"
            . "<div style='font-size:32px;font-weight:bold;letter-spacing:6px;text-align:center;padding:16px;background:#f8e9ff;border-radius:8px'>{$otp}</div>"
            . "<p style='font-size:12px;color:#777'>This code expires in 5 minutes. If you did not request this change, ignore this email.</p></div>";
        $mail->AltBody = "Your KaTrip email verification code is {$otp}. It expires in 5 minutes.";
        $mail->send();
    } catch (Exception $error) {
        securityResponse(500, ['success' => false, 'message' => 'The verification email could not be sent. Please try again.']);
    }

    $_SESSION['pending_email_change'] = [
        'user_id' => $userId,
        'email' => $email,
        'otp' => $otp,
        'otp_expires' => time() + 300
    ];

    securityResponse(200, [
        'success' => true,
        'message' => 'A verification code was sent to your new email.',
        'email' => $email
    ]);
}

if ($action === 'verify_email_otp') {
    $pending = $_SESSION['pending_email_change'] ?? null;
    $otp = trim($_POST['otp'] ?? '');

    if (!$pending || (int)$pending['user_id'] !== $userId) {
        securityResponse(422, ['success' => false, 'message' => 'Request a new verification code first.']);
    }
    if (time() > (int)$pending['otp_expires']) {
        unset($_SESSION['pending_email_change']);
        securityResponse(422, ['success' => false, 'message' => 'The verification code has expired.']);
    }
    if ($otp !== $pending['otp']) {
        securityResponse(422, ['success' => false, 'message' => 'The verification code is incorrect.']);
    }

    $email = $pending['email'];
    $check = $conn->prepare('SELECT user_id FROM users WHERE email = ? AND user_id != ? LIMIT 1');
    $check->bind_param('si', $email, $userId);
    $check->execute();
    if ($check->get_result()->fetch_assoc()) {
        unset($_SESSION['pending_email_change']);
        securityResponse(409, ['success' => false, 'message' => 'That email is already in use.']);
    }

    $update = $conn->prepare('UPDATE users SET email = ? WHERE user_id = ?');
    $update->bind_param('si', $email, $userId);
    if (!$update->execute()) {
        securityResponse(500, ['success' => false, 'message' => 'The email could not be updated.']);
    }

    $_SESSION['email'] = $email;
    unset($_SESSION['pending_email_change']);
    securityResponse(200, ['success' => true, 'message' => 'Your email was updated successfully.', 'email' => $email]);
}

if ($action === 'change_password') {
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
        securityResponse(422, ['success' => false, 'message' => 'Complete all password fields.']);
    }
    if ($newPassword !== $confirmPassword) {
        securityResponse(422, ['success' => false, 'message' => 'The new passwords do not match.']);
    }
    if (strlen($newPassword) < 8) {
        securityResponse(422, ['success' => false, 'message' => 'The new password must be at least 8 characters.']);
    }
    if (!password_verify($currentPassword, $account['password'])) {
        securityResponse(422, ['success' => false, 'message' => 'The current password is incorrect.']);
    }
    if (password_verify($newPassword, $account['password'])) {
        securityResponse(422, ['success' => false, 'message' => 'Choose a new password different from the current password.']);
    }

    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $update = $conn->prepare('UPDATE users SET password = ? WHERE user_id = ?');
    $update->bind_param('si', $passwordHash, $userId);
    if (!$update->execute()) {
        securityResponse(500, ['success' => false, 'message' => 'The password could not be updated.']);
    }

    securityResponse(200, ['success' => true, 'message' => 'Your password was updated successfully.']);
}

securityResponse(422, ['success' => false, 'message' => 'Invalid account-security action.']);
?>