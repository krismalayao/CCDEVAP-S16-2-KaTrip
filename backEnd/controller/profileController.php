<?php
    session_start();
    require "../../config/db.php";

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
                      u.created_at, dp.vehicle_model, dp.plate_number, dp.verification_status
                FROM users u 
                LEFT JOIN driver_profiles dp 
                ON dp.driver_id = u.user_id 
                WHERE u.user_id = ? 
                AND u.role = 'driver'"

            : "SELECT first_name, last_name, gender, phone_number, email, created_at 
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
            profileResponse(200, ["success" => true, "profile" => $profile, "role" => $role]);
        } else {
            profileResponse(404, ["success" => false, "message" => "Profile not found."]);
        }
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        profileResponse(405, ["success" => false, "message" => "Method not allowed."]);
    }

    $phone = trim($_POST["phone"] ?? "");
    $email = filter_var(trim($_POST["email"] ?? ""), FILTER_VALIDATE_EMAIL);
    $gender = str_replace(["-"], "_", trim($_POST["gender"] ?? ""));
    $password = $_POST["password"] ?? "";

    $allowedGenders = ["male", "female", "other", "rather_not_say"];
    if (!$phone || !$email || !in_array($gender, $allowedGenders, true)) {
        profileResponse(422, ["success" => false, "message" => "Invalid input data."]);
    }
    if ($password && strlen($password) < 8) {
        profileResponse(422, ["success" => false, "message" => "Password must be at least 8 characters."]);
    }

    if ($role === "driver" && (empty($_POST["vehicle_model"]) || empty($_POST["plate_number"]))) {
        profileResponse(422, ["success" => false, "message" => "Vehicle details required."]);
    }

    $check = $conn->prepare("SELECT user_id
                             FROM users 
                             WHERE (email = ? OR phone_number = ?) 
                             AND user_id != ?");
    $check->bind_param("ssi", $email, $phone, $userId);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        profileResponse(409, ["success" => false, "message" => "Email or phone in use."]);
    }

    if ($password) {
        $stmt = $conn->prepare("UPDATE users 
                                SET phone_number = ?, email = ?, gender = ?, password = ?
                                WHERE user_id = ?");
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt->bind_param("ssssi", $phone, $email, $gender, $hash, $userId);
    } else {
        $stmt = $conn->prepare("UPDATE users 
                                SET phone_number = ?, email = ?, gender = ? 
                                WHERE user_id = ?");
        $stmt->bind_param("sssi", $phone, $email, $gender, $userId);
    }

    if (!$stmt->execute()) {
        profileResponse(500, ["success" => false, "message" => "Update failed."]);
    }

    if ($role === "driver") {
        $stmt = $conn->prepare("UPDATE driver_profiles 
                                SET vehicle_model = ?, plate_number = ?
                                WHERE driver_id = ?");
        $stmt->bind_param("ssi", $_POST["vehicle_model"], $_POST["plate_number"], $userId);
        $stmt->execute();
    }

    $_SESSION["email"] = $email;
    profileResponse(200, ["success" => true, "message" => "Profile saved.", "profile" => getProfile($conn, $userId, $role), "role" => $role]);
?>