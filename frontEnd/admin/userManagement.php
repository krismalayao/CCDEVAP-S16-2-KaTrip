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
                    <button id="editButton" onclick="openEditModal()">Edit User</button>
                    <button id="deleteButton" onclick="deleteUser()">Delete User</button>
                </div>

                <div class="management-filters">
                    <h3>FILTERS</h3>
                    <input type="text" id="searchInput" placeholder="Search User" onkeyup="searchUsers()">

                    <select id="roleFilter" onchange="filterByRole()">
                        <option>All Roles</option>
                        <option>Passenger</option>
                        <option>Driver</option>
                        <option>Admin</option>
                    </select>

                    <label for="fromDate" class="date">Date From:</label>
                    <input type="date" id="fromDate" onchange="filterDates()">

                    <label for="toDate" class="date">Date To:</label>
                    <input type="date" id="toDate" onchange="filterDates()">
                </div>

            </div>

            <div class="management-data">
                <div class="management-header">
                    <h2>User Management</h2>
                    
                    <button class="add-user-button" onclick="openAddModal()">
                        <span>+</span> Add User</button>
                </div>
                
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
                                        <td><input type="checkbox" name="selectedUser" value="<?= $user["user_id"] ?>" onchange="updateActionButtons()"></td>
                                        <td><?= $user["user_id"] ?></td>
                                        <td><?= $user["first_name"] . " " . $user["last_name"] ?></td>
                                        <td><?= $user["email"] ?></td>
                                        <td><?= ucfirst($user["role"]) ?></td>
                                        <td><?= ucfirst($user["status"]) ?></td>
                                        <td data-date="<?= date("Y-m-d", strtotime($user["created_at"])) ?>">
                                            <?= date("F j, Y", strtotime($user["created_at"])) ?>
                                        </td>
                                        <td class="action-button">
                                            <?php if ($user["status"] == "active"): ?>
                                                <form action="../../backEnd/controller/userManagementController.php" method="POST">
                                                    <input type="hidden" name="action" value="toggleStatus">
                                                    <input type="hidden" name="user_id" value="<?= $user["user_id"] ?>">

                                                    <button type="submit" class="<?= strtolower($user["status"]) == "active" ? "disable-button" : "enable-button" ?>">
                                                        Suspend
                                                    </button>
                                                </form>
                                            
                                            <?php elseif ($user["status"] == "suspended"): ?>
                                                <form action="../../backEnd/controller/userManagementController.php" method="POST">
                                                    <input type="hidden" name="action" value="toggleStatus">
                                                    <input type="hidden" name="user_id" value="<?= $user["user_id"] ?>">

                                                    <button type="submit" class="<?= strtolower($user["status"]) == "active" ? "disable-button" : "enable-button" ?>">
                                                        Activate
                                                    </button>
                                                </form>

                                            <?php elseif ($user["status"] == "pending"): ?>
                                                <form action="../../backEnd/controller/userManagementController.php" method="POST">
                                                    <input type="hidden" name="action" value="approveUser">
                                                    <input type="hidden" name="user_id" value="<?= $user["user_id"] ?>">
                                                    <button type="submit" class="approve-button">
                                                        Approve
                                                    </button>
                                                </form>

                                            <?php else: ?>
                                                <button class="denied-button" disabled>
                                                    Denied
                                                </button>
                                            <?php endif; ?>
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