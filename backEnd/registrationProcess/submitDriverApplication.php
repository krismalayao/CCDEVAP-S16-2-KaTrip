<?php
session_start();
require "../../config/db.php";
require "../../config/uploads.php";
header("Content-Type: application/json");

$registration = $_SESSION['driver_registration_verified'] ?? null;
$passengerId = isset($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'passenger'
    ? (int)$_SESSION['user_id']
    : null;

if (!$registration && !$passengerId) {
    echo json_encode([
        "status" => "error",
        "message" => "Your application session has expired. Please log in or register again."
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
    exit;
}

$license = trim($_POST['license_number'] ?? '');
$vehicle = trim($_POST['vehicle_model'] ?? '');
$plate = trim($_POST['plate_number'] ?? '');
$color = trim($_POST['vehicle_color'] ?? '');
if ($license === '' || $vehicle === '' || $plate === '' || !isset($_POST['agreement_check'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Please complete all required application fields."
    ]);
    exit;
}

$documentFiles = [
    'license' => $_FILES['license_file'] ?? null,
    'vehicle' => $_FILES['vehicle_file'] ?? null,
    'registration' => $_FILES['registration_file'] ?? null,
    'insurance' => $_FILES['insurance_file'] ?? null
];

foreach ($documentFiles as $type => $file) {
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        echo json_encode([
            "status" => "error",
            "message" => "Please upload all four required driver documents."
        ]);
        exit;
    }
}

$conn->begin_transaction();
try {
    if ($registration) {
        $stmt = $conn->prepare(
            "INSERT INTO users
            (first_name, last_name, gender, birthdate, phone_number, email, role, status, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->bind_param(
            "sssssssss",
            $registration['first_name'],
            $registration['last_name'],
            $registration['gender'],
            $registration['birthdate'],
            $registration['phone_number'],
            $registration['email'],
            $registration['role'],
            $registration['status'],
            $registration['password']
        );
        $stmt->execute();
        $driverId = $conn->insert_id;
    } else {
        $user = $conn->prepare("SELECT role FROM users WHERE user_id = ? FOR UPDATE");
        $user->bind_param("i", $passengerId);
        $user->execute();
        $currentUser = $user->get_result()->fetch_assoc();

        if (!$currentUser || $currentUser['role'] !== 'passenger') {
            throw new RuntimeException('Only passenger accounts can submit this application.');
        }

        $existingProfile = $conn->prepare("SELECT driver_id FROM driver_profiles WHERE driver_id = ? LIMIT 1");
        $existingProfile->bind_param("i", $passengerId);
        $existingProfile->execute();
        if ($existingProfile->get_result()->fetch_assoc()) {
            throw new RuntimeException('A driver application already exists for this account.');
        }

        $driverId = $passengerId;
    }

    $profile = $conn->prepare(
        "INSERT INTO driver_profiles
        (driver_id, license_number, vehicle_model, plate_number, vehicle_color, verification_status)
        VALUES (?, ?, ?, ?, ?, 'pending')"
    );
    $profile->bind_param("issss", $driverId, $license, $vehicle, $plate, $color);
    $profile->execute();

    // Save the documents uploaded
    foreach ($documentFiles as $type => $file) {
        $stored = storeValidatedUpload($file, 'driver-documents', $driverId, ['image/jpeg'=>'jpg', 'image/png'=>'png'], 8 * 1024 * 1024, $driverId . '-' . $type);
        $document = $conn->prepare("INSERT INTO driver_documents (driver_id, document_type, file, mime_type, file_size) VALUES (?, ?, ?, ?, ?)");
        $document->bind_param("isssi", $driverId, $type, $stored['stored_name'], $stored['mime_type'], $stored['file_size']);
        $document->execute();
    }

    $conn->commit();
    unset($_SESSION['driver_registration_verified']);

    echo json_encode([
        "status" => "success",
        "message" => $passengerId
            ? "Your driver application has been submitted and is pending verification."
            : "Application submitted. Your account is pending driver verification.",
        "existing_application" => $passengerId !== null
    ]);
} catch (Throwable $error) {
    $conn->rollback();
    echo json_encode([
        "status" => "error",
        "message" => $error->getMessage()
    ]);
}
?>