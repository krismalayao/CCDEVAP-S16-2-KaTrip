<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/userManagementModel.php";

    $specificUsers = $_GET["search"] ?? "";
    $listOfUsers = getAllUsers($conn, $specificUsers);

    // Actions Button in the Far Right
    if (isset($_POST["action"])) {
        if ($_POST["action"] == "toggleStatus") {
            $userId = $_POST["user_id"];
            toggleUserStatus($conn, $userId);

            header("Location: ../../frontEnd/admin/userManagement.php");
            exit();
        }
    }

    // Approving Users
    if (isset($_POST["action"])) {
        $action = $_POST["action"];
        $userId = $_POST["user_id"];

        if ($action == "toggleStatus") {
            toggleUserStatus($conn, $userId);
        }

        if ($action == "approveUser") {
            approveUser($conn, $userId);
        }

        header("Location: ../../frontEnd/admin/userManagement.php");
        exit();
    }
?>