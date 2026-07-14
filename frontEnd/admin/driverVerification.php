<?php
    session_start();
    require "../../backEnd/controller/driverVerificationController.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "admin") {
        header("Location: ../public/loginPage.php"); 
        exit();
    }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="KaTrip Admin - Driver Verification Page">
        <meta name="keywords" content="Admin Page, KaTrip, Driver Verification">
        <meta name="author" content="Team 2">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin - Driver Verification</title>
        <link rel="stylesheet" href="../style/driverVerification.css">
        <link rel="stylesheet" href="../style/navbarAdmin.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
    </head>

    <body class="management-body">
        <div id="navbar-mount"></div>
        <script src="../components/navbarAdmin.js"></script>

        <div class="management-container">
            <aside class="management-features">
                <div class="management-actions">
                    <h3>ACTIONS</h3>
                    <button type="button" onclick="openAddModal()" id="addButton">Add Application</button>
                    <button type="button" onclick="openEditModal()" id="editButton">Edit Application</button>
                    <button type="button" onclick="deleteApplication()" id="deleteButton">Delete Application</button>
                </div>

                <div class="management-filters">
                    <h3>FILTERS</h3>
                    <input type="text" placeholder="Search Applicant" onkeyup="searchApplicants()" id="searchInput">
                    <select id="statusFilter" onchange="filterApplicants()">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="denied">Denied</option>
                    </select>
                </div>
            </aside>

            <main class="management-applicants">
                <h2>Driver Applications</h2>
                <div class="responsive-table">
                    <table id="applicantTable">
                        <thead>
                            <tr>
                                <th>SELECT</th>
                                <th>NAME</th>
                                <th>STATUS</th>
                                <th>DATE APPLIED</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php if (empty($listOfApplicants)): ?>
                                <tr>
                                    <td colspan="4">No applicants have registered.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach($listOfApplicants as $applicant): ?>
                                    <tr class="applicant-card" data-driver-id="<?= $applicant["user_id"] ?>" data-gender="<?= $applicant["gender"] ?>" data-birthdate="<?= $applicant["birthdate"] ?>" data-phone="<?= $applicant["phone_number"] ?>" 
                                                data-license="<?= $applicant["license_number"] ?>" data-vehicle="<?= $applicant["vehicle_model"] ?>" data-status="<?= $applicant["status"] ?>"
                                                data-plate="<?= $applicant["plate_number"] ?>" data-color="<?= $applicant["vehicle_color"] ?>" data-verification="<?= $applicant["verification_status"] ?>" 
                                                data-email="<?= $applicant["email"] ?>" data-license-file="<?= $applicant["license_file"] ? '../../backEnd/controller/viewUploadedFile.php?type=document&amp;id=' . (int)$applicant["license_file"] : '' ?>" data-registration-file="<?= $applicant["registration_file"] ? '../../backEnd/controller/viewUploadedFile.php?type=document&amp;id=' . (int)$applicant["registration_file"] : '' ?>"
                                                data-insurance-file="<?= $applicant["insurance_file"] ? '../../backEnd/controller/viewUploadedFile.php?type=document&amp;id=' . (int)$applicant["insurance_file"] : '' ?>">
                                        <td><input type="radio" class="selectedApplicant" name="selectedApplicant" value="<?= $applicant["user_id"]; ?>" onchange="updateActionButtons()"></td>
                                        <td><?= $applicant["first_name"] . " " . $applicant["last_name"]; ?></td>
                                        <td class="<?php if ($applicant["verification_status"] == 'verified'): echo 'status-active'; 
                                                        elseif($applicant["verification_status"] == 'pending'): echo 'status-pending'; 
                                                        elseif ($applicant["verification_status"] == 'denied'): echo 'status-rejected'; endif; ?>">
                                            <?= ucfirst($applicant["verification_status"]) ?>
                                        </td>
                                         <td data-date="<?= date("Y-m-d", strtotime($applicant["created_at"])) ?>"><?= date("F, j Y", strtotime($applicant["created_at"])); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <div id="pagination"></div>
            </main>

            <section class="management-files">
                <h2>Applicant Details</h2>
                <div id="profileViewer">
                    <p>Select an applicant from the table to view profile information and uploaded documents.</p>
                </div>

                <div class="decision-buttons" id="decisionButtons">
                    <form action="../../backEnd/controller/driverVerificationController.php" method="POST">
                        <input type="hidden" name="action" value="approveDriver">
                        <input type="hidden" name="driver_id" id="approveDriverId">

                        <button type="submit" class="approve">Approve</button>
                    </form>

                    <form action="../../backEnd/controller/driverVerificationController.php" method="POST">
                        <input type="hidden" name="action" value="denyDriver">
                        <input type="hidden" name="driver_id" id="denyDriverId">

                        <button type="submit"class="reject">Deny</button>
                    </form>
                </div>
            </section>
        </div>

        <div class="modal" id="applicationModal">
            <form action="../../backEnd/controller/driverVerificationController.php" method="POST" class="modal-content" enctype="multipart/form-data">
                <input type="hidden" name="action" id="formAction" value="addDriverApplication">
                <input type="hidden" name="driver_id" id="driver_id">

                <h3 id="modalTitle">Add Application</h3>
                <label>First Name</label>
                <input type="text" name="first_name" required>

                <label>Last Name</label>
                <input type="text" name="last_name" required>

                <label>Gender</label>
                <select name="gender" required>
                    <option value="" disabled selected>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="rather_not_say">Rather not say</option>
                </select>

                <label>Birthdate</label>
                <input type="date" name="birthdate" required>

                <label>Phone Number</label>
                <input type="text" name="phone_number" required>

                <label>Email</label>
                <input type="email" name="email" required>

                <label>License Number</label>
                <input type="text" name="license_number" required>

                <label>Vehicle Model</label>
                <input type="text" name="vehicle_model" required>

                <label>Plate Number</label>
                <input type="text" name="plate_number" required>

                <label>Vehicle Color</label>
                <select name="vehicle_color">
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="gray">Gray</option>
                    <option value="brown">Brown</option>
                    <option value="green">Green</option>
                </select>

                <label for="licenseFile">Driver's License</label>
                <input type="file" name="license_file" id="licenseFile">


                <label for="registrationFile">Vehicle Registration</label>
                <input type="file" name="registration_file" id="registrationFile">


                <label for="insuranceFile">Vehicle Insurance</label>
                <input type="file" name="insurance_file" id="insuranceFile">

                <label>Verification Status</label>
                <select name="verification_status" id="verificationStatus">
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="denied">Denied</option>
                </select>
                
                <div class="modal-buttons">
                    <button type="button" class="cancel-button" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="save-button">Save</button>
                </div>
            </form>
        </div>

        <div class="modal" id="confirmModal">
            <div class="modal-content">
                <h3 id="confirmTitle">Confirm Delete</h3>
                <p id="confirmMessage">Are you sure?</p>
                <div class="modal-buttons">
                    <button type="button" class="cancel-button" onclick="closeConfirmModal()">Cancel</button>
                    <button type="button" class="save-button" id="confirmYesBtn">Yes</button>
                </div>
            </div>
        </div>

        <script src="../script/driverVerification.js"></script>
    </body>
</html>
