<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "passenger") {
        header("Location: ../public/loginPage.php");
        exit();
    }

    $userId = $_SESSION["user_id"];
    $user = getUserById($conn, $userId);

    if (!$user) {
        session_destroy();
        header("Location: ../public/loginPage.php");
    }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KaTrip - Passenger Profile</title>
        <link rel="stylesheet" href="../style/style.css">
        <link rel="stylesheet" href="../style/navbar.css">
        <link rel="stylesheet" href="../style/userProfile.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
    </head>
    <body class="passenger-profile-body">
        <div id="navbar-mount"></div>

        <div class="profile-container">
            <section class="profile-heading">
                <!-- Theme Toggle -->
                <div class="theme-toggle">
                    <label class="theme-switch">
                        <input type="checkbox" id="theme-toggle-checkbox">
                        <span class="theme-slider"></span>
                    </label>
                </div>

                <!-- Profile Icon -->
                <div class="profile-avatar" id="avatar-preview">
                    <label class="avatar-edit-label" for="avatar-upload">
                        <input type="file" id="avatar-upload" accept="image/*">
                    </label>
                </div>
                
                <div class="name-display">
                    <h2 id="profile-name">Loading profile...</h2>
                </div>
            </section>
            <section class="profile-details">
                <div class="profile-settings-section">
                    <div class="profile-section-heading">
                        <h3>Personal Information</h3>
                    </div>
                    <div class="profile-section-grid">
                        <div class="profile-field-group">
                            <label for="profile-phone">Number</label>
                            <div class="profile-input-wrapper">
                                <input type="text" id="profile-phone" value="" autocomplete="tel">
                                <button class="profile-field-edit-btn" aria-label="Edit number"></button>
                            </div>
                        </div>
                        <div class="profile-field-group">
                            <label for="profile-gender">Gender</label>
                            <div class="profile-input-wrapper profile-dropdown-wrapper">
                                <select id="profile-gender">
                                    <option value="" selected disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="rather_not_say">Rather not say</option>
                                </select>
                                <button type="button" class="profile-field-edit-btn" aria-label="Edit gender"></button>
                            </div>
                        </div>
                    </div>
                    <div class="profile-section-actions">
                        <button type="button" class="profile-save-btn" id="profile-save-btn">Save</button>
                    </div>
                </div>

                <div class="profile-settings-section profile-security-section">
                    <div class="profile-section-heading">
                        <h3>Account &amp; Security</h3>
                    </div>
                    <div class="profile-section-grid">
                        <div class="profile-field-group">
                            <label for="profile-email">E-mail</label>
                            <div class="profile-input-wrapper">
                                <input type="email" id="profile-email" value="" readonly aria-readonly="true" tabindex="-1">
                                <button type="button" class="profile-field-edit-btn profile-email-edit-btn" id="profile-email-edit-btn" aria-label="Change email"></button>
                            </div>
                        </div>
                        <div class="profile-field-group">
                            <label for="profile-password">Password</label>
                            <div class="profile-input-wrapper">
                                <input type="password" id="profile-password" value="password" readonly aria-readonly="true" tabindex="-1" autocomplete="off">
                                <button type="button" class="profile-field-edit-btn profile-password-edit-btn" id="profile-password-edit-btn" aria-label="Change password"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-metadata">
                    <p id="profile-created-at">Loading...</p>
                </div>
            </section>
        </div>

        <!-- Logout Button -->
        <div class="profile-account-actions">
            <button type="button" class="profile-logout-btn" id="logout-btn">Log Out</button>
        </div>
        
        <!-- CTA -->
        <div class="profile-cta-container">
            <a href="driverApplication.php" class="profile-cta-text">Become a KaTrip Driver</a>
        </div>

        <script src="../components/navbarPassenger.js"></script>
        <script src="../components/profile.js"></script>
    </body>
</html>