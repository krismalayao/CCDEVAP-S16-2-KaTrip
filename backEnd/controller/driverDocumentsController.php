<?php
session_start();
require '../../config/db.php';
require '../../config/uploads.php';

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'driver') {
    uploadJsonResponse(403, ['success' => false, 'message' => 'Driver access required.']);
}

$driverId = (int)$_SESSION['user_id'];
$allowedTypes = ['license', 'vehicle', 'registration', 'insurance'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('SELECT document_id, document_type, mime_type, uploaded_at 
                            FROM driver_documents 
                            WHERE driver_id = ?');
    $stmt->bind_param('i', $driverId);
    $stmt->execute();
    
    $documents = [];
    foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $row) {
        $documents[$row['document_type']] = [
            'url'         => '/CCDEVAP-S16-2-KaTrip/backEnd/controller/viewUploadedFile.php?type=document&id=' . (int)$row['document_id'],
            'mime_type'   => $row['mime_type'],
            'uploaded_at' => $row['uploaded_at']
        ];
    }
    uploadJsonResponse(200, ['success' => true, 'documents' => $documents]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    uploadJsonResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
}

if (($_POST['action'] ?? '') === 'submit_for_reapproval') {
    $conn->begin_transaction();

    $profileQuery = $conn->prepare(
        "UPDATE driver_profiles
         SET verification_status = 'pending'
         WHERE driver_id = ?"
    );
    $profileQuery->bind_param('i', $driverId);

    $userQuery = $conn->prepare(
        "UPDATE users
         SET status = 'pending'
         WHERE user_id = ? AND role = 'driver'"
    );
    $userQuery->bind_param('i', $driverId);

    $profileUpdated = $profileQuery->execute();
    $userUpdated = $userQuery->execute();

    if (!$profileUpdated || !$userUpdated) {
        $conn->rollback();
        uploadJsonResponse(500, ['success' => false, 'message' => 'Unable to submit the account for reapproval.']);
    }

    $conn->commit();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    uploadJsonResponse(200, [
        'success' => true,
        'message' => 'Documents submitted for admin reapproval.',
        'logout_required' => true
    ]);
}

$documentType = $_POST['document_type'] ?? '';
if (!in_array($documentType, $allowedTypes, true)) {
    uploadJsonResponse(422, ['success' => false, 'message' => 'Invalid document type.']);
}

try {
    $allowedMimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'application/pdf' => 'pdf'];
    // Check if document already exists
    $stmt = $conn->prepare('SELECT document_id, file FROM driver_documents WHERE driver_id = ? AND document_type = ? LIMIT 1');
    $stmt->bind_param('is', $driverId, $documentType);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();

    // Remove the old file before reusing the readable driver-document name.
    if ($existing) {
        removeUpload($existing['file']);
    }

    $stored = storeValidatedUpload($_FILES['document'] ?? [], 'driver-documents', $driverId, $allowedMimes, 8 * 1024 * 1024, $driverId . '-' . $documentType);

    if ($existing) {
        // Update existing record
        $stmt = $conn->prepare('UPDATE driver_documents 
                                SET file = ?, mime_type = ?, file_size = ?, uploaded_at = CURRENT_TIMESTAMP 
                                WHERE document_id = ?');
        $stmt->bind_param('ssii', $stored['stored_name'], $stored['mime_type'], $stored['file_size'], $existing['document_id']);
        $stmt->execute();
        $documentId = (int)$existing['document_id'];
    } else {
        // Insert new record
        $stmt = $conn->prepare('INSERT INTO driver_documents (driver_id, document_type, file, mime_type, file_size) 
                                VALUES (?, ?, ?, ?, ?)');
        $stmt->bind_param('isssi', $driverId, $documentType, $stored['stored_name'], $stored['mime_type'], $stored['file_size']);
        $stmt->execute();
        $documentId = (int)$conn->insert_id;
    }

    uploadJsonResponse(200, [
        'success' => true, 
        'message' => 'Document updated.', 
        'document' => [
            'url' => '/CCDEVAP-S16-2-KaTrip/backEnd/controller/viewUploadedFile.php?type=document&id=' . $documentId,
            'mime_type' => $stored['mime_type']
        ]
    ]);

} catch (RuntimeException $error) {
    if (isset($stored['stored_name'])) removeUpload($stored['stored_name']);
    uploadJsonResponse(422, ['success' => false, 'message' => $error->getMessage()]);
}
?>
