<?php
    session_start();
    session_destroy();

    header("Location: ../../frontEnd/public/loginPage.php");
    exit();
?>