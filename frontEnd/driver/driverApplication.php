<?php
session_start();

if (!isset($_SESSION['driver_registration_verified'])) {
    header('Location: ../public/registerPage.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KaTrip - Driver Application Form</title>
    <link rel="stylesheet" href="../style/style.css">
    <link rel="stylesheet" href="../style/navbar.css">
    <link rel="stylesheet" href="../style/driverApplication.css">
    <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
</head>
<body class="driver-application-body">
    <div id="navbar-public"></div>

    <div class="application-layout">
        <h1 class="application-heading">Become a KaTrip Driver</h1>

        <form class="application-form" id="driver-application-form">
            <!-- Driver's License Number Input -->
            <div class="form-group">
                <label for="license_number">Driver's License Number <span class="required">*</span></label>
                    <input type="text" id="license_number" name="license_number" placeholder="A01-23-456789" required>
            </div>

            <!-- Driver's License Image Upload -->
            <div class="form-group">
                <label>Upload Driver's License <span class="required">*</span></label>
                <p class="upload-hint">Make sure the <span class="highlight">License Number</span> is clear and readable</p>
                <div class="upload-dropzone" data-title="Choose a file to upload" data-subtitle="(PNG, JPG only)" onclick="this.querySelector('input').click()">
                    <input type="file" id="license_file" name="license_file" accept=".png, .jpg, .jpeg" required hidden>
                    <div class="upload-icon-placeholder"></div>
                </div>
            </div>

            <div class="form-row-three">
                <!-- Vehicle Model Input -->
                <div class="form-group relative-input">
                    <label for="vehicle_model">Vehicle Model <span class="required">*</span></label>
                    <div class="search-input-wrapper">
                        <input type="text" id="vehicle_model" name="vehicle_model" required>
                        <div class="search-icon-placeholder"></div>
                    </div>
                </div>
                
                <!-- Vehicle Plate Number Input -->
                <div class="form-group">
                    <label for="plate_number">Plate Number <span class="required">*</span></label>
                    <input type="text" id="plate_number" name="plate_number" placeholder="ABC 1234" required>
                </div>
                
                <!-- Vehicle Color Input -->
                <div class="form-group">
                    <label for="vehicle_color">Color</label>
                    <div class="select-wrapper">
                        <select id="vehicle_color" name="vehicle_color">
                            <option value="" selected></option>
                            <option value="black">Black</option>
                            <option value="white">White</option>
                            <option value="red">Red</option>
                            <option value="blue">Blue</option>
                            <option value="gray">Gray</option>
                            <option value="brown">Brown</option>
                            <option value="green">Green</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Vehicle Image Upload -->
            <div class="form-group">
                <label>Upload Vehicle Picture <span class="required">*</span></label>
                <p class="upload-hint">Make sure the <span class="highlight">front of the vehicle</span> and <span class="highlight">license plate</span> is clear and readable</p>
                <div class="upload-dropzone" data-title="Choose a file to upload" data-subtitle="(PNG, JPG only)" onclick="this.querySelector('input').click()">
                    <input type="file" id="vehicle_file" name="vehicle_file" accept=".png, .jpg, .jpeg" required hidden>
                    <div class="upload-icon-placeholder"></div>
                </div>
            </div>

            <!-- Vehicle Registration Image Upload -->
            <div class="form-group">
                <label>Upload Vehicle Registration <span class="required">*</span></label>
                <p class="upload-hint">To be submitted for verification and community accountability purposes</p>
                <div class="upload-dropzone" data-title="Choose a file to upload" data-subtitle="(PNG, JPG only)" onclick="this.querySelector('input').click()">
                    <input type="file" id="registration_file" name="registration_file" accept=".png, .jpg, .jpeg" required hidden>
                    <div class="upload-icon-placeholder"></div>
                </div>
            </div>

            <!--Vehicle Insurance Image Upload -->
            <div class="form-group">
                <label>Upload Vehicle Insurance <span class="required">*</span></label>
                <p class="upload-hint">To be submitted for verification and community accountability purposes</p>
                <div class="upload-dropzone" data-title="Choose a file to upload" data-subtitle="(PNG, JPG only)" onclick="this.querySelector('input').click()">
                    <input type="file" id="insurance_file" name="insurance_file" accept=".png, .jpg, .jpeg" required hidden>
                    <div class="upload-icon-placeholder"></div>
                </div>
            </div>

            <!-- Agreement Checkbox -->
            <div class="form-checkbox-group">
                <input type="checkbox" id="agreement_check" required>
                <label for="agreement_check">
                    I acknowledge that the submitted documents will be used for verification and safety purposes within the platform. <span class="required">*</span>
                </label>
            </div>

            <div class="form-actions">
                <button type="submit" class="application-submit-btn">Submit</button>
            </div>

        </form>
    </div>

    <div id="application-success-modal" class="application-modal" hidden>
        <div class="application-modal-content" role="dialog" aria-modal="true" aria-labelledby="application-success-title">
            <p id="application-success-message"></p>
            <button type="button" id="application-success-close">Continue to Login</button>
        </div>
    </div>
    
    <script src="../components/navbarPublic.js"></script>
    <script src="../script/features.js"></script>
</body>
</html>