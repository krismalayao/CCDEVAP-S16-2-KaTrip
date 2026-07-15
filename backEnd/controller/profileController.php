<?php
    session_start();
    require "../../config/db.php";
    require "../../config/uploads.php";

    function profileResponse($status, $payload) {
        http_response_code($status);
        echo json_encode($payload);
        exit();
    }

    if (!isset($_SESSION["user_id"], $_SESSION["role"])) {
        profileResponse(401, ["success" => false, "message" => "Please log in."]);
    }

    $userId = (int)$_SESSION["user_id"];
    $role = $_SESSION["role"];

    function getProfile($conn, $userId, $role) {
        $isDriver = ($role === "driver");
        $sql = $isDriver 
            ? "SELECT u.first_name, u.last_name, u.gender, u.phone_number, u.email,
                      u.created_at, u.profile_picture, u.theme_preference,
                      dp.vehicle_model, dp.plate_number, dp.vehicle_color, dp.show_full_name
                FROM users u 
                LEFT JOIN driver_profiles dp 
                ON dp.driver_id = u.user_id 
                WHERE u.user_id = ? 
                AND u.role = 'driver'"

            : "SELECT first_name, last_name, gender, phone_number, email, created_at, profile_picture, theme_preference
               FROM users 
               WHERE user_id = ? 
               AND role = 'passenger'";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $profile = getProfile($conn, $userId, $role);
        if ($profile) {
            $profile['profile_picture_url'] = $profile['profile_picture'] ? '../../backEnd/controller/viewUploadedFile.php?type=profile' : null;
            unset($profile['profile_picture']);
            profileResponse(200, ["success" => true, "profile" => $profile, "role" => $role]);
        } else {
            profileResponse(404, ["success" => false, "message" => "Profile not found."]);
        }
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        profileResponse(405, ["success" => false, "message" => "Method not allowed."]);
    }

    if (isset($_POST["theme_only"])) {
        $theme = $_POST["theme_preference"] ?? "light";
        if (!in_array($theme, ["light", "dark"], true)) {
            profileResponse(422, ["success" => false, "message" => "Invalid theme."]);
        }
        $stmt = $conn->prepare("UPDATE users SET theme_preference = ? WHERE user_id = ?");
        $stmt->bind_param("si", $theme, $userId);
        $stmt->execute();
        profileResponse(200, ["success" => true, "theme_preference" => $theme]);
    }

    $action = $_POST["action"] ?? "save_personal";

    if ($action === "save_personal") {
        $phone = trim($_POST["phone"] ?? "");
        $gender = str_replace(["-"], "_", trim($_POST["gender"] ?? ""));
        $theme = $_POST["theme_preference"] ?? "light";
        $allowedGenders = ["male", "female", "other", "rather_not_say"];

        if (!$phone || !in_array($gender, $allowedGenders, true) || !in_array($theme, ["light", "dark"], true)) {
            profileResponse(422, ["success" => false, "message" => "Invalid personal information."]);
        }

        $check = $conn->prepare("SELECT user_id
                                 FROM users
                                 WHERE phone_number = ?
                                 AND user_id != ?");
        $check->bind_param("si", $phone, $userId);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            profileResponse(409, ["success" => false, "message" => "Phone number already in use."]);
        }

        $stmt = $conn->prepare("UPDATE users
                                SET phone_number = ?, gender = ?, theme_preference = ?
                                WHERE user_id = ?");
        $stmt->bind_param("sssi", $phone, $gender, $theme, $userId);
        if (!$stmt->execute()) {
            profileResponse(500, ["success" => false, "message" => "Personal information could not be updated."]);
        }
        if ($role === "driver") {
            $showFullName = ($_POST["show_full_name"] ?? "0") === "1" ? 1 : 0;
            $stmt = $conn->prepare("UPDATE driver_profiles SET show_full_name = ? WHERE driver_id = ?");
            $stmt->bind_param("ii", $showFullName, $userId);
            if (!$stmt->execute()) {
                profileResponse(500, ["success" => false, "message" => "Name visibility could not be updated."]);
            }
        }
    } elseif ($action === "save_driver_details") {
        if ($role !== "driver") {
            profileResponse(403, ["success" => false, "message" => "Driver information is not available for this account."]);
        }

        $vehicleModel = trim($_POST["vehicle_model"] ?? "");
        $plateNumber = trim($_POST["plate_number"] ?? "");
        $vehicleColor = trim($_POST["vehicle_color"] ?? "");
        if ($vehicleModel === "" || $plateNumber === "") {
            profileResponse(422, ["success" => false, "message" => "Vehicle model and license plate are required."]);
        }

        $allowedColors = ["", "black", "white", "red", "blue", "gray", "brown", "green"];
        if (!in_array($vehicleColor, $allowedColors, true)) {
            profileResponse(422, ["success" => false, "message" => "Invalid vehicle color."]);
        }
        $stmt = $conn->prepare("UPDATE driver_profiles SET vehicle_model = ?, plate_number = ?, vehicle_color = ? WHERE driver_id = ?");
        $stmt->bind_param("sssi", $vehicleModel, $plateNumber, $vehicleColor, $userId);
        if (!$stmt->execute()) {
            profileResponse(500, ["success" => false, "message" => "Vehicle details could not be updated."]);
        }
    } else {
        profileResponse(422, ["success" => false, "message" => "Invalid profile action."]);
    }

    $profile = getProfile($conn, $userId, $role);
    $profile['profile_picture_url'] = $profile['profile_picture'] ? '../../backEnd/controller/viewUploadedFile.php?type=profile' : null;
    unset($profile['profile_picture']);
    $message = $action === "save_driver_details" ? "Vehicle details saved." : "Personal information saved.";
    profileResponse(200, ["success" => true, "message" => $message, "profile" => $profile, "role" => $role]);
?>
