<?php
    $host = 'localhost:3306';
    $dbname = 'katrip_db.sql';
    $username = 'root';
    $password = 'Dlsu1234!'; // This can change, depende sa MySQL Workbench password niyo

    $conn = mysqli_connect($host, $username, $password, $dbname);
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

?>