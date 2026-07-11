<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/userManagementModel.php";

    $specificUsers = $_GET["search"] ?? "";
    $listOfUsers = getAllUsers($conn, $specificUsers);
?>