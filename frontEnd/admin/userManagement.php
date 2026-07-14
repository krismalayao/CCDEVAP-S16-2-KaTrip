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
                        <span class="plus">+</span>
                        <span class="text">Add User</span>
                    </button>
                </div>
                
                <div class="responsive-table">
                    <table id="userTable">
                        <thead>
                            <tr>
                                <th class="center">SELECT</th>
                                <th class="center">USER ID</th>
                                <th>FULL NAME</th>
                                <th>EMAIL</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>DATE REGISTERED</th>
                                <th class="center">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php if (empty($listOfUsers)): ?>
                                <tr>
                                    <td colspan="8">No Users Found.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach($listOfUsers as $user): ?>
                                    <tr data-gender="<?= $user["gender"] ?>" data-birthdate="<?= $user["birthdate"] ?>" data-phone="<?= $user["phone_number"] ?>">
                                        <td class="center"><input type="checkbox" class="selectedUser" name="selectedUser" value="<?= $user["user_id"] ?>" onchange="updateActionButtons()"></td>
                                        <td class="center"><?= $user["user_id"] ?></td>
                                        <td><?= $user["first_name"] . " " . $user["last_name"] ?></td>
                                        <td><?= $user["email"] ?></td>
                                        <td><?= ucfirst($user["role"]) ?></td>
                                        <td class="<?php if ($user["status"] == 'active'): echo 'status-active'; 
                                                        elseif($user["status"] == 'pending'): echo 'status-pending'; 
                                                        elseif($user["status"] == 'suspended'): echo 'status-suspended'; 
                                                        elseif ($user["status"] == 'denied'): echo 'status-denied'; endif; ?>">
                                                        <?= ucfirst($user["status"]) ?></td>
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
            <form action="../../backEnd/controller/userManagementController.php" method="POST" class="modal-content" id="userForm">
                <input type="hidden" name="action" value="addUser" id="formAction">
                <input type="hidden" name="user_id" id="user_id">

                <h3 id="modalTitle">Add User</h3>

                <label for="first_name">First Name</label>
                <input type="text" name="first_name" required>

                <label for="last_name">Last Name</label>
                <input type="text" name="last_name" required>

                <label for="gender">Gender</label>
                <select id="gender" name="gender" required>
                    <option value="" disabled selected>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="rather-not-to-say">Rather not say</option>
                </select>

                <label for="birthdate">Birthdate</label>
                <input type="date" id="birthdate" name="birthdate" required>

                <label for="phone_number">Phone Number</label>
                <input type="tel" id="phone_number" name="phone_number" placeholder="123-456-7890" required>

                <label for="email">Email</label>
                <input type="email" name="email" required>

                <label for="role">Role</label>
                <select id="role" name="role" required>
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                </select>

                <label for="status">Status</label>
                <select name="status">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
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
                <ul id="deleteUserList"></ul>

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