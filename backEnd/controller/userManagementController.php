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
        } elseif ($action == "addUser") { // Adding Users
            $firstName = $_POST["first_name"];
            $lastName = $_POST["last_name"];
            $userGender = $_POST["gender"];
            $userBirthdate = $_POST["birthdate"];
            $phoneNumber = $_POST["phone_number"];
            $userEmail = $_POST["email"];
            $userRole = $_POST["role"];
            $userStatus = $_POST["status"];

            $result = addUser($conn, $firstName, $lastName, $userGender, $userBirthdate, $phoneNumber, $userEmail, $userRole, $userStatus);

            if ($result) {
                header("Location: ../../frontEnd/admin/userManagement.php?message=successful");
                exit();
            } else {
                header("Location: ../../frontEnd/admin/userManagement.php?message=duplicate");
                exit();
            }
        } elseif ($action == "editUser") { // Edit User
            $userId = $_POST["user_id"];
            $firstName = $_POST["first_name"];
            $lastName = $_POST["last_name"];
            $userGender = $_POST["gender"];
            $userBirthdate = $_POST["birthdate"];
            $phoneNumber = $_POST["phone_number"];
            $userEmail = $_POST["email"];
            $userRole = $_POST["role"];
            $userStatus = $_POST["status"];

            editUser($conn, $userId, $firstName, $lastName, $userGender, $userBirthdate, $phoneNumber, $userEmail, $userRole, $userStatus);
        } elseif ($action == "deleteUser") { // Delete User/s
            $userIds = json_decode($_POST["user_ids"]);
            
            foreach ($userIds as $user) {
                deleteUser($conn, $user);
            }
        }

        header("Location: ../../frontEnd/admin/userManagement.php");
        exit();
    }

    $specificUsers = $_GET["search"] ?? "";
    $listOfUsers = getAllUsers($conn, $specificUsers);
    
?>