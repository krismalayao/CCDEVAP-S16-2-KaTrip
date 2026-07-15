<?php
define('KATRIP_UPLOAD_ROOT', getenv('KATRIP_UPLOAD_ROOT') ?: dirname(__DIR__) . '/storage/uploads');

function uploadJsonResponse(int $status, array $payload): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit();
}

function storeValidatedUpload(array $file, string $category, int $ownerId, array $allowedMimes, int $maxBytes, ?string $fileBaseName = null): array {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('The file could not be uploaded.');
    }
    if (($file['size'] ?? 0) < 1 || $file['size'] > $maxBytes) {
        throw new RuntimeException('The selected file exceeds the allowed size.');
    }
    if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        throw new RuntimeException('Invalid upload.');
    }

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($allowedMimes[$mimeType])) {
        throw new RuntimeException('This file type is not allowed.');
    }

    $subDir = $category . DIRECTORY_SEPARATOR . $ownerId;
    $fullDir = KATRIP_UPLOAD_ROOT . DIRECTORY_SEPARATOR . $subDir;
    
    if (!is_dir($fullDir) && !mkdir($fullDir, 0700, true) && !is_dir($fullDir)) {
        throw new RuntimeException('Upload storage is unavailable.');
    }

    $fileName = $fileBaseName ?: bin2hex(random_bytes(24));
    $storedName = $fileName . '.' . $allowedMimes[$mimeType];
    $absolutePath = $fullDir . DIRECTORY_SEPARATOR . $storedName;

    if (!move_uploaded_file($file['tmp_name'], $absolutePath)) {
        throw new RuntimeException('The uploaded file could not be saved.');
    }

    return [
        'stored_name'   => str_replace(DIRECTORY_SEPARATOR, '/', $subDir . DIRECTORY_SEPARATOR . $storedName),
        'absolute_path' => $absolutePath,
        'mime_type'     => $mimeType,
        'file_size'     => (int)$file['size']
    ];
}

function uploadPath(string $storedName): ?string {
    $root = realpath(KATRIP_UPLOAD_ROOT);
    $path = KATRIP_UPLOAD_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $storedName);
    $realPath = realpath($path);

    if (!$root || !$realPath || !str_starts_with($realPath, $root . DIRECTORY_SEPARATOR) || !is_file($realPath)) {
        return null;
    }
    return $realPath;
}

function removeUpload(?string $storedName): void {
    if ($storedName && $path = uploadPath($storedName)) {
        @unlink($path);
    }
}
?>
