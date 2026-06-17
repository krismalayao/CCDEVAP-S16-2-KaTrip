let confirmCallback = null;

/* MODAL CONTROL */
function openAddModal() {
    const modal = document.getElementById("userModal");

    document.getElementById("modalTitle").textContent = "Add User";
    modal.classList.add("show");
    modal.dataset.mode = "add";

    resetUserModal();
}

function openEditModal() {
    const row = getSelectedRow();
    if (!row) return alert("Please select a user first.");

    const modal = document.getElementById("userModal");

    document.getElementById("modalTitle").textContent = "Edit User";
    modal.classList.add("show");
    modal.dataset.mode = "edit";

    const cells = row.cells;

    document.querySelector("#userModal input[type='text']").value = cells[2].textContent;
    document.querySelector("#userModal input[type='email']").value = cells[3].textContent;

    const selects = document.querySelectorAll("#userModal select");
    selects[0].value = cells[4].textContent.trim();
    selects[1].value = cells[5].textContent.trim();
}

function closeModal() {
    document.getElementById("userModal").classList.remove("show");
}

/* RESET MODAL */
function resetUserModal() {
    document.querySelectorAll("#userModal input").forEach(i => i.value = "");
    document.querySelectorAll("#userModal select").forEach(s => s.selectedIndex = 0);
}

/* CONFIRM MODAL */
function openConfirmModal(title, message, onConfirm) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;

    confirmCallback = onConfirm;

    document.getElementById("confirmModal").classList.add("show");
}

function closeConfirmModal() {
    document.getElementById("confirmModal").classList.remove("show");
    confirmCallback = null;
}

/* SINGLE HANDLER ONLY */
document.getElementById("confirmYesBtn").onclick = function () {
    if (typeof confirmCallback === "function") confirmCallback();
    closeConfirmModal();
};

/* DELETE USER */
function deleteUser() {
    const row = getSelectedRow();
    if (!row) return;

    openConfirmModal(
        "Delete User",
        "Are you sure you want to delete this user?",
        () => {
            row.remove();
            applyFilters();
        }
    );
}

/* SAVE (ADD / EDIT) */
document.querySelector(".save-button").onclick = function () {

    const modal = document.getElementById("userModal");
    const mode = modal.dataset.mode;

    const fullName = document.querySelector("#userModal input[type='text']").value;
    const email = document.querySelector("#userModal input[type='email']").value;

    const selects = document.querySelectorAll("#userModal select");
    const role = selects[0].value;
    const status = selects[1].value;

    if (mode === "edit") {

        openConfirmModal(
            "Confirm Update",
            "Are you sure with the updates?",
            () => {
                const row = getSelectedRow();
                if (!row) return;

                row.cells[2].textContent = fullName;
                row.cells[3].textContent = email;
                row.cells[4].textContent = role;
                row.cells[5].textContent = status;

                const statusCell = row.cells[5];
                statusCell.className = status === "Active"
                    ? "status-active"
                    : "status-inactive";

                closeModal();
                applyFilters();
            }
        );

    } else {
        closeModal();
    }
};

/* HELPERS */
function getSelectedRow() {
    const selected = document.querySelector("input[name='selectedUser']:checked");
    return selected ? selected.closest("tr") : null;
}

/* CORE FILTER SYSTEM FOR STATIC */
let filters = {
    search: "",
    role: "all",
    from: "",
    to: ""
};

const rowsPerPage = 7;
let currentPage = 1;

function searchUsers() {
    filters.search = document.getElementById("searchInput").value.toLowerCase();
    currentPage = 1;
    applyFilters();
}

function filterByRole() {
    filters.role = document.getElementById("roleFilter").value.toLowerCase();
    currentPage = 1;
    applyFilters();
}

function filterDates() {
    filters.from = document.getElementById("fromDate").value;
    filters.to = document.getElementById("toDate").value;
    currentPage = 1;
    applyFilters();
}

function applyFilters() {
    const table = document.getElementById("userTable");
    const allRows = Array.from(table.querySelectorAll("tbody tr"));

    const filteredRows = allRows.filter(row => {
        const text = row.textContent.toLowerCase();
        const role = row.cells[4].textContent.trim().toLowerCase();
        const rowDate = row.dataset.date;

        return (
            text.includes(filters.search) &&
            (filters.role === "all" || role === filters.role) &&
            (!filters.from || rowDate >= filters.from) &&
            (!filters.to || rowDate <= filters.to)
        );
    });

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = 1;

    allRows.forEach(r => (r.style.display = "none"));

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    filteredRows.slice(start, end).forEach(r => r.style.display = "");

    renderPagination(totalPages);
}

/* PAGINATION */
function renderPagination(totalPages) {
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const wrapper = document.createElement("div");

    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
        currentPage--;
        applyFilters();
    };

    const label = document.createElement("span");
    label.textContent = ` ${currentPage} of ${totalPages} `;

    const next = document.createElement("button");
    next.textContent = ">";
    next.disabled = currentPage === totalPages;
    next.onclick = () => {
        currentPage++;
        applyFilters();
    };

    wrapper.append(prev, label, next);
    container.appendChild(wrapper);
}

/* STATUS TOGGLE */
function toggleStatus(button) {
    const row = button.closest("tr");
    const statusCell = row.querySelector(".status-active, .status-inactive");

    const isActive = statusCell.classList.contains("status-active");

    statusCell.textContent = isActive ? "Inactive" : "Active";
    statusCell.classList.toggle("status-active", !isActive);
    statusCell.classList.toggle("status-inactive", isActive);

    button.textContent = isActive ? "Enable" : "Disable";
    button.classList.toggle("disable-button", !isActive);
    button.classList.toggle("enable-button", isActive);
}

window.onload = applyFilters;