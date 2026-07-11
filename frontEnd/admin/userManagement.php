<?php
    session_start();
    require "../../backEnd/controller/userManagementController.php";

    if (!isset($_SESSION["email"]) || $_SESSION["role"] !== "admin") {
        header("Location: ../public/loginPage.php"); 
        exit();
    }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="KaTrip Admin - User Management Page">
        <meta name="keywords" content="Admin Page, KaTrip, User">
        <meta name="author" content="Team 2">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin - User Management</title>
        <link rel="stylesheet" href="../style/userManagement.css">
        <link rel="stylesheet" href="../style/navbarAdmin.css">
        <link rel="icon" type="image/svg+xml" href="../src/images/katrip_logo.svg">
    </head>

    <body class="management-body">
        <div id="navbar-mount"></div>

        <div class="management-container">
            <div class="management-features">
                <div class="management-actions">
                    <h3>ACTIONS</h3>
                    <button onclick="openAddModal()">Add User</button>
                    <button onclick="openEditModal()">Edit User</button>
                    <button onclick="deleteUser()">Delete User</button>
                </div>

                <div class="management-filters">
                    <h3>FILTERS</h3>
                    <input type="text" id="searchInput" placeholder="Search User" onkeyup="searchUsers()">

                    <select id="roleFilter" onchange="filterByRole()">
                        <option>All Roles</option>
                        <option>Passenger</option>
                        <option>Driver</option>
                    </select>

                    <label for="fromDate" class="date">Date From:</label>
                    <input type="date" id="fromDate" onchange="filterDates()">

                    <label for="toDate" class="date">Date To:</label>
                    <input type="date" id="toDate" onchange="filterDates()">
                </div>

            </div>

            <div class="management-data">
                <h2>User Management</h2>
                <div class="responsive-table">
                    <table id="userTable">
                        <thead>
                            <tr>
                                <th>SELECT</th>
                                <th>USER ID</th>
                                <th>FULL NAME</th>
                                <th>EMAIL</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>DATE REGISTERED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php if (empty($listOfUsers)): ?>
                                <tr>
                                    <td colspan="8">No Users Found.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach($listOfUsers as $user): ?>
                                    <tr>
                                        <td><input type="checkbox" name="selectedUser" value="<?= $user["user_id"] ?>"></td>
                                        <td><?= $user["user_id"] ?></td>
                                        <td><?= $user["first_name"] . " " . $user["last_name"] ?></td>
                                        <td><?= $user["email"] ?></td>
                                        <td><?= $user["role"] ?></td>
                                        <td><?= $user["status"] ?></td>
                                        <td><?= $user["created_at"] ?></td>
                                        <td class="action-button">
                                            <button class="<?= $user["status"] == "Active" ? "disable-button" : "enable-button" ?>" onclick="toggleStatus(this)">
                                                <?= $user["status"] == "Active" ? "Disable" : "Enable" ?>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
                <div id="pagination"></div>
            </div>
        </div>

        <div class="modal" id="userModal">
            <div class="modal-content">
                <h3 id="modalTitle">Add User</h3>

                <label>Full Name</label>
                <input type="text">

                <label>Email</label>
                <input type="email">

                <label>Role</label>
                <select>
                    <option>Passenger</option>
                    <option>Driver</option>
                </select>

                <label>Status</label>
                <select>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>

                <div class="modal-buttons">
                    <button class="cancel-button" onclick="closeModal()">Cancel</button>
                    <button class="save-button">Save</button>
                </div>
            </div>
        </div>

        <div class="modal" id="confirmModal">
            <div class="modal-content">
                <h3 id="confirmTitle">Confirm Action</h3>
                <p id="confirmMessage">Are you sure?</p>

                <div class="modal-buttons">
                    <button class="cancel-button" onclick="closeConfirmModal()">Cancel</button>
                    <button class="save-button" id="confirmYesBtn">Yes</button>
                </div>
            </div>
        </div>

        <script src="../components/navbarAdmin.js"></script>
        <script src="../script/userManagement.js"></script>
    </body>
</html>