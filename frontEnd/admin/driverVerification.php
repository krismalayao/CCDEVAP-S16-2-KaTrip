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
                    <button type="button" onclick="openAddModal()">Add Application</button>
                    <button type="button" onclick="openEditModal()">Edit Application</button>
                    <button type="button" onclick="deleteApplication()">Delete Application</button>
                </div>

                <div class="management-filters">
                    <h3>FILTERS</h3>
                    <input type="text" id="searchInput" placeholder="Search Applicant">
                    <select id="statusFilter">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
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
                                    <tr class="applicant-card">
                                        <td><input type="radio" name="selectedApplicant" value="<?= $applicant["user_id"]; ?>"></td>
                                        <td><?= $applicant["full_name"]; ?></td>
                                        <td class="<?php if ($applicant["status"] == 'active'): echo 'status-active'; 
                                                        elseif($applicant["status"] == 'pending'): echo 'status-pending'; 
                                                        elseif ($applicant["status"] == 'denied'): echo 'status-rejected'; endif; ?>">
                                            <?= ucfirst($applicant["status"]) ?>
                                        </td>
                                        <td><?= date("F, j Y", strtotime($applicant["created_at"])); ?></td>
                                    </tr>
                                <?php endforeach ?>
                            <?php endif ?>
                        </tbody>
                    </table>
                </div>
            </main>

            <section class="management-files">
                <h2>Applicant Details</h2>
                <div id="profileViewer">
                    <p>Select an applicant from the table to view profile information and uploaded documents.</p>
                </div>

                <div class="decision-buttons" id="decisionButtons" style="display: none;">
                    <button type="button" class="approve" onclick="approveApplicant()">Accept</button>
                    <button type="button" class="reject" onclick="rejectApplicant()">Reject</button>
                </div>
            </section>
        </div>

        <div class="modal" id="applicationModal">
            <div class="modal-content">
                <h3 id="modalTitle">Add Application</h3>
                
                <label for="firstName">First Name</label>
                <input type="text" id="firstName">
                
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName">
                
                <label for="gender">Gender</label>
                <select id="gender">
                    <option value="" disabled selected>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-binary</option>
                    <option value="Others">Others</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                </select>
                
                <label for="phoneNumber">Phone Number</label>
                <input type="text" id="phoneNumber">
                
                <label for="email">Email</label>
                <input type="email" id="email">
                
                <label for="licenseNumber">License Number</label>
                <input type="text" id="licenseNumber">
                
                <label for="vehicleModel">Vehicle Model</label>
                <input type="text" id="vehicleModel">
                
                <label for="plateNumber">Plate Number</label>
                <input type="text" id="plateNumber">
                
                <label for="verificationStatus">Status</label>
                <select id="verificationStatus">
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                </select>
                
                <div class="modal-buttons">
                    <button type="button" class="cancel-button" onclick="closeModal()">Cancel</button>
                    <button type="button" class="save-button" onclick="saveApplication()">Save</button>
                </div>
            </div>
        </div>

        <div class="modal" id="confirmModal">
            <div class="modal-content">
                <h3 id="confirmTitle">Confirm Action</h3>
                <p id="confirmMessage">Are you sure?</p>
                <div class="modal-buttons">
                    <button type="button" class="cancel-button" onclick="closeConfirmModal()">Cancel</button>
                    <button type="button" class="save-button" id="confirmYesBtn" onclick="handleConfirmYes()">Yes</button>
                </div>
            </div>
        </div>

        <script src="../script/driverVerification.js"></script>
    </body>
</html>