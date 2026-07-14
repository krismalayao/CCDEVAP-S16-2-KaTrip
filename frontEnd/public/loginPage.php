<?php
    session_start();

    $loginEmail = $_SESSION['login_email'] ?? '';
    $loginError = $_SESSION['login_error'] ?? '';
    unset($_SESSION['login_email'], $_SESSION['login_error']);

    if (isset($_SESSION["email"]) && isset($_SESSION["role"])) {
        if ($_SESSION["role"] == "admin") {
            header("Location: ../../frontEnd/admin/adminDashboard.php");
            exit();
        } else if ($_SESSION["role"] === "driver") {
            header("Location: ../../frontEnd/driver/driverDashboard.php");
            exit();
        } else {
            header("Location: ../../frontEnd/passenger/passengerDashboard.php");
            exit();
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta name="description" content="KaTrip User Login Page">
        <meta name="keywords" content="Login, KaTrip, User, Car Ride">
        <meta name="author" content="Team 2">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KaTrip - Login Page</title>
        <link rel="stylesheet" href="../style/publicPages.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
    </head>
    
    <body class="login-body">
        <div class="login-container">
            <div class="login-header">
                <img src="../src/images/katrip_logo.svg">
                <h2>KaTrip</h2>
            </div>

            <form action="../../backEnd/controller/userLoginController.php" method="POST">
                <label for="email">Email <span class="asterisk">*</span></label><br />
                <input type="email" id="email" name="email" placeholder="username@email.com" value="<?= htmlspecialchars($loginEmail, ENT_QUOTES, 'UTF-8') ?>" required><br />

                <label for="password">Password <span class="asterisk">*</span></label><br />
                <div class="login-password-feature <?= $loginError ? 'login-input-error' : '' ?>">
                    <input type="password" id="password" name="password" placeholder="Input Password" required>
                    <button type="button" id="toggle-button" class="toggle-button">
                        <i id="toggle-icon" class="bx bxs-lock-alt"></i>
                    </button>
                </div>
                <?php if ($loginError): ?>
                    <p class="login-error-message"><?= htmlspecialchars($loginError, ENT_QUOTES, 'UTF-8') ?></p>
                <?php endif; ?>

                <button type="submit" class="login-button" name="submit">Login</button>
            </form>

            <p>Don't have an account yet? <a href="registerPage.html">Sign up</a></p>
        </div>

        <script src="../script/features.js"></script>
    </body>
</html>
