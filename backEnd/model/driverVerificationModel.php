<?php
    require "../../config/db.php";
    require_once __DIR__ . "/../../config/uploads.php";

    function getAllDriverApps($conn) {
        $stmt = $conn->query("SELECT u.user_id, u.first_name, u.last_name, u.gender,
                              u.birthdate, u.phone_number, u.email, u.status, u.created_at,
                              dp.license_number, dp.vehicle_model, dp.plate_number,
                              dp.vehicle_color, dp.verification_status,
                              MAX(CASE WHEN dd.document_type = 'license' THEN dd.document_id END) AS license_file,
                              MAX(CASE WHEN dd.document_type = 'vehicle' THEN dd.document_id END) AS vehicle_file,
                              MAX(CASE WHEN dd.document_type = 'registration' THEN dd.document_id END) AS registration_file,
                              MAX(CASE WHEN dd.document_type = 'insurance' THEN dd.document_id END) AS insurance_file
                              FROM users AS u
                              JOIN driver_profiles AS dp ON u.user_id = dp.driver_id
                              LEFT JOIN driver_documents AS dd ON dp.driver_id = dd.driver_id
                              WHERE u.role = 'driver'
                              GROUP BY u.user_id, u.first_name, u.last_name, u.gender, u.birthdate, u.phone_number,
                                       u.email, u.created_at, dp.license_number, dp.vehicle_model, dp.plate_number,
                                       dp.vehicle_color, dp.verification_status
                              ORDER BY u.created_at DESC;");
        return $stmt->fetch_all(MYSQLI_ASSOC);
    }

    function getDriverAppDetails($conn, $driver_id) {
        $stmt = $conn->prepare("SELECT u.*, dp.license_number, dp.vehicle_model, dp.plate_number,
                              dp.vehicle_color, dp.verification_status FROM users AS u
                              JOIN driver_profiles AS dp ON u.user_id = dp.driver_id
                              WHERE u.user_id = ?;");
        $stmt->bind_param("i", $driver_id);
        $stmt->execute();

        $driver = $stmt->get_result()->fetch_assoc();
        
        if ($driver){
            $documents = getDriverDocuments($conn, $driver_id);
            $driver["documents"] = $documents;
        }

        return $driver;
    }

    function getDriverDocuments($conn, $driver_id) {
        $stmt = $conn->prepare("SELECT document_type, file 
                                FROM driver_documents
                                WHERE driver_id = ?;");
        $stmt->bind_param("i", $driver_id);
        $stmt->execute();

        $documents = []; // Array

        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $documents[$row["document_type"]] = $row["file"];
        }

        return $documents;
    }

    function addDriverApplication($conn, $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $license_number, $vehicle_model, $plate_number, $vehicle_color, $status, $verification_status) {
        // Check for Duplicate Email/Phone Number
        $check = $conn->prepare("SELECT user_id FROM users
                                 WHERE email = ? OR phone_number = ?;");
        $check->bind_param("ss", $email, $phone_number);
        $check->execute();

        if($check->get_result()->num_rows > 0){
            return false;
        }

        // Adding it into the Users Table first
        $password = password_hash("katrip123", PASSWORD_DEFAULT); // Default Password of User
        $role = "driver"; // Default Role for Adding Driver Apps
        $stmt = $conn->prepare("INSERT INTO users(first_name, last_name, gender, birthdate, phone_number, email, role, status, password)
                                VALUES (?,?,?,?,?,?,?,?,?);");
        $stmt->bind_param("sssssssss", $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $role, $status, $password);

        if(!$stmt->execute()){
            return false;
        }

        // Adding now to the Driver Profiles Table
        $driver_id = $conn->insert_id;
        $profile = $conn->prepare("INSERT INTO driver_profiles(driver_id, license_number, vehicle_model, plate_number, vehicle_color, verification_status)
                                   VALUES(?,?,?,?,?,?);");
        $profile->bind_param("isssss", $driver_id, $license_number, $vehicle_model, $plate_number, $vehicle_color, $verification_status);
        
        if (!$profile->execute()) {
            return false;
        }

        uploadDriverDocuments($conn, $driver_id, $_FILES);

        return true;
    }

    function uploadDriverDocuments($conn, $driver_id, $files) {
        saveDriverDocumentFiles($conn, $driver_id, $files);
    }

    function updateDriverDocuments($conn, $driver_id, $files) {
        saveDriverDocumentFiles($conn, $driver_id, $files);
    }

    function saveDriverDocumentFiles($conn, $driver_id, $files) {
        $documents = ["license_file" => "license", "vehicle_file" => "vehicle", "registration_file" => "registration", "insurance_file" => "insurance"];
        $allowedMimeTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'application/pdf' => 'pdf'];
        foreach ($documents as $input => $type) {
            if (!isset($files[$input]) || $files[$input]['error'] === UPLOAD_ERR_NO_FILE) continue;
            $stored = storeValidatedUpload($files[$input], 'driver-documents', (int)$driver_id, $allowedMimeTypes, 8 * 1024 * 1024, $driver_id . '-' . $type);
            $check = $conn->prepare('SELECT document_id, file FROM driver_documents WHERE driver_id = ? AND document_type = ? LIMIT 1');
            $check->bind_param('is', $driver_id, $type);
            $check->execute();
            $existing = $check->get_result()->fetch_assoc();
            if ($existing) {
                $stmt = $conn->prepare('UPDATE driver_documents SET file = ?, mime_type = ?, file_size = ?, uploaded_at = CURRENT_TIMESTAMP WHERE document_id = ?');
                $stmt->bind_param('ssii', $stored['stored_name'], $stored['mime_type'], $stored['file_size'], $existing['document_id']);
            } else {
                $stmt = $conn->prepare('INSERT INTO driver_documents (driver_id, document_type, file, mime_type, file_size) VALUES (?, ?, ?, ?, ?)');
                $stmt->bind_param('isssi', $driver_id, $type, $stored['stored_name'], $stored['mime_type'], $stored['file_size']);
            }
            if (!$stmt->execute()) {
                removePrivateUpload($stored['stored_name']);
                throw new RuntimeException('Unable to save an uploaded driver document.');
            }
            removePrivateUpload($existing['file'] ?? null);
        }
    }

    function editDriverApplication($conn, $driver_id, $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $license_number, $vehicle_model, $plate_number, $vehicle_color, $verification_status) {
        // Check for Duplicate Email/Phone Number
        $check = $conn->prepare("SELECT user_id FROM users
                                 WHERE (email = ? OR phone_number = ?) AND user_id != ?;");
        $check->bind_param("ssi", $email, $phone_number, $driver_id);
        $check->execute();

        if($check->get_result()->num_rows > 0){
            return false;
        }

        // Updating the Users Table
        $user = $conn->prepare("UPDATE users SET
                                first_name = ?, last_name = ?, gender= ?,
                                birthdate = ?, phone_number = ?, email = ?
                                WHERE user_id=?;");
        $user->bind_param("ssssssi", $first_name, $last_name, $gender, $birthdate, $phone_number, $email, $driver_id);
     
        if (!$user->execute()) {
            return false;
        }

        // Updating the Driver Profiles Table After
        $profile = $conn->prepare("UPDATE driver_profiles SET
                                   license_number = ?, vehicle_model= ?,
                                   plate_number = ?, vehicle_color= ?, verification_status = ?
                                   WHERE driver_id = ?;");
        $profile->bind_param("sssssi", $license_number, $vehicle_model, $plate_number, $vehicle_color, $verification_status, $driver_id);

        if (!$profile->execute()) {
            return false;
        }

        // Sync users.status with driver_profiles.verification_status
        if ($verification_status == "verified") {
            $userStatus = "active";
        } elseif ($verification_status == "denied") {
            $userStatus = "denied";
        } else {
            $userStatus = "pending";
        }

        $statusUpdate = $conn->prepare("UPDATE users
                                        SET status = ?
                                        WHERE user_id = ?;");
        $statusUpdate->bind_param("si", $userStatus, $driver_id);

        if (!$statusUpdate->execute()) {
            return false;
        }

        // Update documents if new files are uploaded
        updateDriverDocuments($conn, $driver_id, $_FILES);
        return true;
    }

    function approveDriver($conn, $driver_id){
        $profile = $conn->prepare("UPDATE driver_profiles
                                   SET verification_status = 'verified'
                                   WHERE driver_id = ?;");
        $profile->bind_param("i", $driver_id);

        if(!$profile->execute()){
            return false;
        }

        $user = $conn->prepare("UPDATE users
                                SET status = 'active'
                                WHERE user_id = ?;");
        $user->bind_param("i", $driver_id);

        return $user->execute();
    }

    function denyDriver($conn, $driver_id){
        $profile = $conn->prepare("UPDATE driver_profiles
                                   SET verification_status = 'denied'
                                   WHERE driver_id = ?;");
        $profile->bind_param("i", $driver_id);

        if(!$profile->execute()){
            return false;
        }

        $user = $conn->prepare("UPDATE users
                                SET status = 'denied'
                                WHERE user_id = ?;");
        $user->bind_param("i", $driver_id);

        return $user->execute();
    }

    function deleteDriverApplication($conn, $driver_id){
        $stmt = $conn->prepare("DELETE FROM users
                              WHERE user_id = ?;");
        $stmt->bind_param("i", $driver_id);
        return $stmt->execute();
    }
?>
