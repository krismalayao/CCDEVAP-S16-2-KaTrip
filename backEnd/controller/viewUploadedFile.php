<?php
session_start();
require '../../config/db.php';
require '../../config/uploads.php';

if (!isset($_SESSION['user_id'], $_SESSION['role'])) {
    http_response_code(401);
    exit('Please log in.');
}

$type = $_GET['type'] ?? '';
$storedName = null;
$mimeType = null;

if ($type === 'profile') {
    $requestedUserId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : (int)$_SESSION['user_id'];
    
    if ($requestedUserId !== (int)$_SESSION['user_id'] && $_SESSION['role'] !== 'admin') {
        http_response_code(403);
        exit('Access denied.');
    }

    $stmt = $conn->prepare('SELECT profile_picture FROM users WHERE user_id = ?');
    $stmt->bind_param('i', $requestedUserId);
    $stmt->execute();
    $storedName = $stmt->get_result()->fetch_assoc()['profile_picture'] ?? null;

} elseif ($type === 'document') {
    $stmt = $conn->prepare('SELECT driver_id, file, mime_type FROM driver_documents WHERE document_id = ?');
    $stmt->bind_param('i', $_GET['id'] ?? 0);
    $stmt->execute();
    $doc = $stmt->get_result()->fetch_assoc();

    if (!$doc || ($_SESSION['role'] !== 'admin' && (int)$doc['driver_id'] !== (int)$_SESSION['user_id'])) {
        http_response_code(403);
        exit('Access denied.');
    }

    $storedName = $doc['file'];
    $mimeType   = $doc['mime_type'];
} else {
    http_response_code(400);
    exit('Invalid file request.');
}

$path = $storedName ? privateUploadPath($storedName) : null;
if (!$path || !file_exists($path)) {
    http_response_code(404);
    exit('File not found.');
}

if (!$mimeType) {
    $mimeType = mime_content_type($path) ?: 'application/octet-stream';
}

header("Content-Type: $mimeType");
header('Content-Length: ' . filesize($path));
header('Content-Disposition: inline; filename="file.' . pathinfo($path, PATHINFO_EXTENSION) . '"');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-store');

readfile($path);
exit;
?>