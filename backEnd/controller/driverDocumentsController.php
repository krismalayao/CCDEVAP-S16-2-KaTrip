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
            'url'         => '../../backEnd/controller/viewUploadedFile.php?type=document&id=' . (int)$row['document_id'],
            'mime_type'   => $row['mime_type'],
            'uploaded_at' => $row['uploaded_at']
        ];
    }
    uploadJsonResponse(200, ['success' => true, 'documents' => $documents, 'csrf_token' => uploadCsrfToken()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    uploadJsonResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
}

if (!verifyUploadCsrf()) {
    uploadJsonResponse(403, ['success' => false, 'message' => 'Invalid security token.']);
}

$documentType = $_POST['document_type'] ?? '';
if (!in_array($documentType, $allowedTypes, true)) {
    uploadJsonResponse(422, ['success' => false, 'message' => 'Invalid document type.']);
}

try {
    $allowedMimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'application/pdf' => 'pdf'];
    $stored = storeValidatedUpload($_FILES['document'] ?? [], 'driver-documents', $driverId, $allowedMimes, 8 * 1024 * 1024);

    // Check if document already exists
    $stmt = $conn->prepare('SELECT document_id, file FROM driver_documents WHERE driver_id = ? AND document_type = ? LIMIT 1');
    $stmt->bind_param('is', $driverId, $documentType);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();

    if ($existing) {
        // Update existing record
        $stmt = $conn->prepare('UPDATE driver_documents 
                                SET file = ?, original_name = ?, mime_type = ?, file_size = ?, uploaded_at = CURRENT_TIMESTAMP 
                                WHERE document_id = ?');
        $stmt->bind_param('sssii', $stored['stored_name'], $stored['original_name'], $stored['mime_type'], $stored['file_size'], $existing['document_id']);
        $stmt->execute();
        $documentId = (int)$existing['document_id'];
        removePrivateUpload($existing['file']);
    } else {
        // Insert new record
        $stmt = $conn->prepare('INSERT INTO driver_documents (driver_id, document_type, file, original_name, mime_type, file_size) 
                                VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('issssi', $driverId, $documentType, $stored['stored_name'], $stored['original_name'], $stored['mime_type'], $stored['file_size']);
        $stmt->execute();
        $documentId = (int)$conn->insert_id;
    }

    uploadJsonResponse(200, [
        'success' => true, 
        'message' => 'Document updated.', 
        'document' => [
            'url' => '../../backEnd/controller/viewUploadedFile.php?type=document&id=' . $documentId,
            'mime_type' => $stored['mime_type']
        ]
    ]);

} catch (RuntimeException $error) {
    if (isset($stored['stored_name'])) removePrivateUpload($stored['stored_name']);
    uploadJsonResponse(422, ['success' => false, 'message' => $error->getMessage()]);
}
?>