<?php
session_start();
require "../../config/db.php";
require "../../config/uploads.php";
header("Content-Type: application/json");

$registration = $_SESSION['driver_registration_verified'] ?? null;

if (!$registration) {
    echo json_encode([
        "status" => "error",
        "message" => "Your registration session has expired. Please register again."
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
if ($license === '' || $vehicle === '' || $plate === '') {
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
        "message" => "Application submitted. Your account is pending driver verification."
    ]);
} catch (Throwable $error) {
    $conn->rollback();
    echo json_encode([
        "status" => "error",
        "message" => $error->getMessage()
    ]);
}
?>
