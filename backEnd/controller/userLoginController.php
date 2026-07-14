<?php
    session_start();
    require "../../config/db.php";
    require "../model/userSessionModel.php";

    $email = trim($_POST["email"] ?? "");
    $pass = trim($_POST["password"] ?? "");

    if (empty($email) || empty($pass)) {
        $_SESSION['login_email'] = $email;
        header("Location: ../../frontEnd/public/loginPage.php");
        exit();
    }

    $user = getUserEmail($conn, $email);

    if ($user && password_verify($pass, $user["password"])) {
        if ($user["status"] === "suspended" || $user["status"] === "denied") {
            header("Location: ../../frontEnd/public/loginPage.php");
            exit();
        }

        $_SESSION["user_id"] = $user["user_id"];
        $_SESSION["role"] = $user["role"];
        $_SESSION["email"] = $user["email"];

        if ($user["role"] == "admin") {
            header("Location: ../../frontEnd/admin/adminDashboard.php");
            exit();
        } else if ($user["role"] == "driver") {
            header("Location: ../../frontEnd/driver/driverDashboard.html");
            exit();
        } else {
            header("Location: ../../frontEnd/passenger/passengerDashboard.php");
            exit();
        }
    } else {
        $_SESSION['login_email'] = $email;
        $_SESSION['login_error'] = 'The password you entered is incorrect';
        header("Location: ../../frontEnd/public/loginPage.php");
        exit();
    }

?>
