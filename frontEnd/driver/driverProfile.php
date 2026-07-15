<?php
    session_start();

    require "../../config/db.php";
    require "../../backEnd/model/userSessionModel.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "driver") {
        header("Location: ../public/loginPage.php");
        exit();
    }

    $userId = $_SESSION["user_id"];
    $user = getUserById($conn, $userId);

    if (!$user) {
        session_destroy();
        header("Location: ../public/loginPage.php");
        exit();
    }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KaTrip - Driver Profile</title>
        <link rel="stylesheet" href="../style/style.css">
        <link rel="stylesheet" href="../style/navbar.css">
        <link rel="stylesheet" href="../style/userProfile.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
    </head>
    <body class="driver-profile-body">
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
                    <div class="profile-privacy-setting">
                        <input type="checkbox" id="profile-show-full-name" checked>
                        <label for="profile-show-full-name">Show my full name to passengers</label>
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

        <!-- View / Update Application Documents -->
        <div class="profile-cta-container">
            <button type="button" class="profile-cta-text" id="open-driver-docs-btn">View / Update Documents</button>
        </div>

        <!-- Driver Documents Modal -->
        <div class="driver-docs-modal" id="driver-docs-modal" aria-hidden="true" role="dialog" aria-labelledby="driver-docs-title">
            <div class="driver-docs-modal-content">
                <button type="button" class="driver-docs-modal-close" id="driver-docs-close" aria-label="Close">&times;</button>

                <h3 id="driver-docs-title">Application Documents</h3>
                <p class="driver-docs-modal-desc">View your submitted documents or upload new files to replace them. Accepted formats: PNG, JPG.</p>

                <div class="driver-docs-list">
                    <article class="driver-doc-item" data-doc="license">
                        <div class="driver-doc-header">
                            <div>
                                <h4>Driver's License</h4>
                                <p class="driver-doc-hint">License number must be clear and readable.</p>
                            </div>
                            <span class="driver-doc-updated-badge" id="badge-license" hidden>Updated</span>
                        </div>
                        <div class="driver-doc-preview driver-doc-preview-clickable" id="preview-license" role="button" tabindex="0" aria-label="View driver's license in full size">
                            <img class="driver-doc-image" id="img-license" alt="Driver's license" hidden>
                            <span class="driver-doc-empty">No document uploaded</span>
                        </div>
                        <div class="driver-doc-actions">
                            <button type="button" class="driver-doc-view-btn" id="view-license" hidden>View larger</button>
                            <input type="file" id="reupload-license" accept=".png,.jpg,.jpeg" hidden>
                            <button type="button" class="driver-doc-reupload-btn" id="reupload-btn-license">Re-upload</button>
                        </div>
                    </article>

                    <article class="driver-doc-item" data-doc="vehicle">
                        <div class="driver-doc-header">
                            <div>
                                <h4>Vehicle Picture</h4>
                                <p class="driver-doc-hint">Front of the vehicle and license plate must be visible.</p>
                            </div>
                            <span class="driver-doc-updated-badge" id="badge-vehicle" hidden>Updated</span>
                        </div>
                        <div class="driver-vehicle-details" aria-label="Vehicle details">
                            <div>
                                <label class="driver-vehicle-detail-label" for="profile-vehicle-model">Vehicle Model</label>
                                <input type="text" id="profile-vehicle-model" autocomplete="off">
                            </div>
                            <div>
                                <label class="driver-vehicle-detail-label" for="profile-license-plate">License Plate</label>
                                <input type="text" id="profile-license-plate" autocomplete="off">
                            </div>
                        </div>
                        <div class="driver-doc-preview driver-doc-preview-clickable" id="preview-vehicle" role="button" tabindex="0" aria-label="View vehicle picture in full size">
                            <img class="driver-doc-image" id="img-vehicle" alt="Vehicle picture" hidden>
                            <span class="driver-doc-empty">No document uploaded</span>
                        </div>
                        <div class="driver-doc-actions">
                            <button type="button" class="driver-doc-view-btn" id="view-vehicle" hidden>View larger</button>
                            <input type="file" id="reupload-vehicle" accept=".png,.jpg,.jpeg" hidden>
                            <button type="button" class="driver-doc-reupload-btn" id="reupload-btn-vehicle">Re-upload</button>
                        </div>
                    </article>

                    <article class="driver-doc-item" data-doc="registration">
                        <div class="driver-doc-header">
                            <div>
                                <h4>Vehicle Registration</h4>
                                <p class="driver-doc-hint">Submitted for verification purposes.</p>
                            </div>
                            <span class="driver-doc-updated-badge" id="badge-registration" hidden>Updated</span>
                        </div>
                        <div class="driver-doc-preview driver-doc-preview-clickable" id="preview-registration" role="button" tabindex="0" aria-label="View vehicle registration in full size">
                            <img class="driver-doc-image" id="img-registration" alt="Vehicle registration" hidden>
                            <span class="driver-doc-empty">No document uploaded</span>
                        </div>
                        <div class="driver-doc-actions">
                            <button type="button" class="driver-doc-view-btn" id="view-registration" hidden>View larger</button>
                            <input type="file" id="reupload-registration" accept=".png,.jpg,.jpeg" hidden>
                            <button type="button" class="driver-doc-reupload-btn" id="reupload-btn-registration">Re-upload</button>
                        </div>
                    </article>

                    <article class="driver-doc-item" data-doc="insurance">
                        <div class="driver-doc-header">
                            <div>
                                <h4>Vehicle Insurance</h4>
                                <p class="driver-doc-hint">Submitted for verification purposes.</p>
                            </div>
                            <span class="driver-doc-updated-badge" id="badge-insurance" hidden>Updated</span>
                        </div>
                        <div class="driver-doc-preview driver-doc-preview-clickable" id="preview-insurance" role="button" tabindex="0" aria-label="View vehicle insurance in full size">
                            <img class="driver-doc-image" id="img-insurance" alt="Vehicle insurance" hidden>
                            <span class="driver-doc-empty">No document uploaded</span>
                        </div>
                        <div class="driver-doc-actions">
                            <button type="button" class="driver-doc-view-btn" id="view-insurance" hidden>View larger</button>
                            <input type="file" id="reupload-insurance" accept=".png,.jpg,.jpeg" hidden>
                            <button type="button" class="driver-doc-reupload-btn" id="reupload-btn-insurance">Re-upload</button>
                        </div>
                    </article>
                </div>

                <div class="driver-docs-modal-actions">
                    <button type="button" class="driver-docs-cancel-btn" id="driver-docs-cancel">Cancel</button>
                    <button type="button" class="driver-docs-save-btn" id="driver-docs-save">Save Changes</button>
                </div>
            </div>
        </div>

        <!-- In-page document lightbox -->
        <div class="driver-doc-lightbox" id="driver-doc-lightbox" aria-hidden="true" role="dialog" aria-labelledby="driver-doc-lightbox-title">
            <div class="driver-doc-lightbox-backdrop" id="driver-doc-lightbox-backdrop"></div>
            <div class="driver-doc-lightbox-panel">
                <button type="button" class="driver-doc-lightbox-close" id="driver-doc-lightbox-close" aria-label="Close preview">&times;</button>
                <p class="driver-doc-lightbox-title" id="driver-doc-lightbox-title"></p>
                <div class="driver-doc-lightbox-image-wrap">
                    <img class="driver-doc-lightbox-image" id="driver-doc-lightbox-image" alt="">
                </div>
            </div>
        </div>

        <script src="../components/navbar.js"></script>
        <script src="../components/profile.js"></script>
        <script src="../script/driverProfileDocuments.js"></script>
    </body>
</html>