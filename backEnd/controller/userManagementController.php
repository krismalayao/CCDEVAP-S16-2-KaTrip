<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/userManagementModel.php";

    if (isset($_POST["action"])) {
        $action = $_POST["action"];
        
        if ($action == "toggleStatus") { // Suspend or Activate
            $userId = $_POST["user_id"];
            toggleUserStatus($conn, $userId);
        } elseif ($action == "approveUser") { // Approve Users
            $userId = $_POST["user_id"];
            approveUser($conn, $userId);
        } elseif ($_POST["action"] == "addUser") { // Adding Users
            $firstName = $_POST["first_name"];
            $lastName = $_POST["last_name"];
            $userGender = $_POST["gender"];
            $userBirthdate = $_POST["birthdate"];
            $phoneNumber = $_POST["phone_number"];
            $userEmail = $_POST["email"];
            $userRole = $_POST["role"];
            $userStatus = $_POST["status"];

            addUser($conn, $firstName, $lastName, $userGender, $userBirthdate, $phoneNumber, $userEmail, $userRole, $userStatus);
        }

        header("Location: ../../frontEnd/admin/userManagement.php");
        exit();
    }

    $specificUsers = $_GET["search"] ?? "";
    $listOfUsers = getAllUsers($conn, $specificUsers);
    
?>