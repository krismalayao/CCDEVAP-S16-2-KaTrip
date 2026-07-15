<?php
session_start();
require '../../config/db.php';
require '../../config/uploads.php';

if (!isset($_SESSION['user_id'], $_SESSION['role'])) {
    uploadJsonResponse(401, ['success' => false, 'message' => 'Please log in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    uploadJsonResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
}

try {
    $userId = (int)$_SESSION['user_id'];
    $allowedMimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    
    $stmt = $conn->prepare('SELECT profile_picture FROM users WHERE user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $oldName = $stmt->get_result()->fetch_assoc()['profile_picture'] ?? null;

    $stored = storeValidatedUpload(
        $_FILES['profile_picture'] ?? [],
        'profile-pictures',
        $userId,
        $allowedMimes,
        3 * 1024 * 1024,
        $userId . '-pfp'
    );

    $stmt = $conn->prepare('UPDATE users SET profile_picture = ? WHERE user_id = ?');
    $stmt->bind_param('si', $stored['stored_name'], $userId);
    
    if (!$stmt->execute()) {
        throw new RuntimeException('The profile picture could not be updated.');
    }

    if ($oldName !== $stored['stored_name']) {
        removeUpload($oldName);
    }

    uploadJsonResponse(200, [
        'success' => true, 
        'message' => 'Profile picture updated.', 
        'url' => '../../backEnd/controller/viewUploadedFile.php?type=profile'
    ]);

} catch (RuntimeException $error) {
    if (isset($stored['stored_name'])) {
        removeUpload($stored['stored_name']);
    }
    uploadJsonResponse(422, ['success' => false, 'message' => $error->getMessage()]);
}
?>
