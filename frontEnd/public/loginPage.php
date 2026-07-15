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

            <!-- LEFT BRAND PANEL -->
            <div class="login-left">
            <div class="login-left-logo">
                <div class="login-left-logo-box">
                <img src="../src/images/katrip_logo.svg">
                </div>
                <span class="login-left-brand">KaTrip</span>
            </div>
            <img src="../src/images/katrip_login1.svg" class="login-illustration" alt="">
            <div class="login-left-headline">Your ride,<br>your schedule.</div>
            <div class="login-left-sub">Connect with drivers and passengers going your way — every day.</div>
            </div>

            <!-- RIGHT FORM PANEL -->
            <div class="login-right">
            <div class="login-form-title">Welcome back</div>
            <div class="login-form-sub">Sign in to your KaTrip account</div>

            <form action="../../backEnd/controller/userLoginController.php" method="POST">
                <label for="email">Email<span class="asterisk">*</span></label>
                <input type="email" id="email" name="email" placeholder="you@email.com"
                value="<?= htmlspecialchars($loginEmail, ENT_QUOTES, 'UTF-8') ?>" required>

                <label for="password">Password<span class="asterisk">*</span></label>
                <div class="login-password-feature <?= $loginError ? 'login-input-error' : '' ?>">
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
                <button type="button" id="toggle-button" class="toggle-button">
                    <i id="toggle-icon" class="bx bxs-lock-alt"></i>
                </button>
                </div>
                <?php if ($loginError): ?>
                <p class="login-error-message"><?= htmlspecialchars($loginError, ENT_QUOTES, 'UTF-8') ?></p>
                <?php endif; ?>

                <button type="submit" class="login-button" name="submit">Sign in</button>
            </form>

            <p>Don't have an account? <a href="registerPage.html">Sign up</a></p>
            </div>

        </div>
    <script src="../script/features.js"></script>
    </body>
</html>
