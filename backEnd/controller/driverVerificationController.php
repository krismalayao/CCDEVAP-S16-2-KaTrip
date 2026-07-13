<?php
    require __DIR__ . "/../../config/db.php";
    require __DIR__ . "/../model/driverVerificationModel.php";

    if (isset($_POST["action"])) {
        
    }

    $listOfApplicants = getAllDriverApps($conn);
?>