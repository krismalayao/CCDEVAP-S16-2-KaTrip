let confirmCallback = null;

/* MODAL CONTROL */
function openAddModal() {
    const modal = document.getElementById("userModal");
    if (!modal) return;

    document.getElementById("modalTitle").textContent = "Add User";
    modal.classList.add("show");
    modal.dataset.mode = "add";

    resetUserModal();
}

function openEditModal() {
    const row = getSelectedRow();
    if (!row) return alert("Please select a user first.");

    const modal = document.getElementById("userModal");
    if (!modal) return;

    document.getElementById("modalTitle").textContent = "Edit User";
    modal.classList.add("show");
    modal.dataset.mode = "edit";

    const cells = row.cells;
    if (cells.length < 6) return;

    const nameInput = document.querySelector("#userModal input[type='text']");
    const emailInput = document.querySelector("#userModal input[type='email']");
    if (nameInput) nameInput.value = cells[2].textContent;
    if (emailInput) emailInput.value = cells[3].textContent;

    const selects = document.querySelectorAll("#userModal select");
    if (selects.length >= 2) {
        selects[0].value = cells[4].textContent.trim();
        selects[1].value = cells[5].textContent.trim();
    }
}

function closeModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.classList.remove("show");
}

/* RESET MODAL */
function resetUserModal() {
    document.querySelectorAll("#userModal input").forEach(i => i.value = "");
    document.querySelectorAll("#userModal select").forEach(s => s.selectedIndex = 0);
}

/* CONFIRM MODAL */
function openConfirmModal(title, message, onConfirm) {
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    const modal = document.getElementById("confirmModal");

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    
    confirmCallback = onConfirm;

    if (modal) modal.classList.add("show");
}

function closeConfirmModal() {
    const modal = document.getElementById("confirmModal");
    if (modal) modal.classList.remove("show");
    confirmCallback = null;
}

/* DELETE USER */
function deleteUser() {
    const row = getSelectedRow();
    if (!row) return alert("Please select a user first.");

    openConfirmModal(
        "Delete User",
        "Are you sure you want to delete this user?",
        () => {
            row.remove();
            applyFilters();
        }
    );
}

/* SAVE DATA HANDLER */
function handleSaveAction() {
    const modal = document.getElementById("userModal");
    if (!modal) return;
    
    const mode = modal.dataset.mode;
    const fullName = document.querySelector("#userModal input[type='text']").value;
    const email = document.querySelector("#userModal input[type='email']").value;

    const selects = document.querySelectorAll("#userModal select");
    if (selects.length < 2) return;
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
                statusCell.className = status === "Active" ? "status-active" : "status-inactive";

                closeModal();
                applyFilters();
            }
        );
    } else {
        closeModal();
    }
}

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
    const searchInput = document.getElementById("searchInput");
    filters.search = searchInput ? searchInput.value.toLowerCase().trim() : "";
    currentPage = 1;
    applyFilters();
}

function filterByRole() {
    const roleSelect = document.getElementById("roleFilter");
    if (roleSelect) {
        const roleValue = roleSelect.value.toLowerCase().trim();
        if (roleValue === "all" || roleValue === "all roles") {
            filters.role = "all";
        } else {
            filters.role = roleValue;
        }
    }
    currentPage = 1;
    applyFilters();
}

function filterDates() {
    const fromInput = document.getElementById("fromDate");
    const toInput = document.getElementById("toDate");
    filters.from = fromInput ? fromInput.value : "";
    filters.to = toInput ? toInput.value : "";
    currentPage = 1;
    applyFilters();
}

function applyFilters() {
    const table = document.getElementById("userTable");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const allRows = Array.from(tbody.querySelectorAll("tr"));

    const filteredRows = allRows.filter(row => {
        if (!row.cells || row.cells.length < 6) return false;

        const nameText = row.cells[2].textContent.toLowerCase();
        const emailText = row.cells[3].textContent.toLowerCase();
        const matchesSearch = nameText.includes(filters.search) || emailText.includes(filters.search);

        const role = row.cells[4].textContent.trim().toLowerCase();
        const matchesRole = (filters.role === "all" || role === filters.role);

        const rowDate = row.dataset.date || "";
        let matchesDateFrom = true;
        let matchesDateTo = true;

        if (filters.from) matchesDateFrom = (rowDate >= filters.from);
        if (filters.to)   matchesDateTo = (rowDate <= filters.to);

        return matchesSearch && matchesRole && matchesDateFrom && matchesDateTo;
    });

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = 1;

    allRows.forEach(r => (r.style.display = "none"));

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    filteredRows.slice(start, end).forEach(r => (r.style.display = ""));

    renderPagination(totalPages);
}

/* PAGINATION */
function renderPagination(totalPages) {
    const container = document.getElementById("pagination");
    if (!container) return;
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
    if (!row) return;

    const statusCell = row.querySelector(".status-active, .status-inactive");
    if (!statusCell) return;

    const isActive = statusCell.classList.contains("status-active");

    statusCell.textContent = isActive ? "Inactive" : "Active";
    statusCell.classList.toggle("status-active", !isActive);
    statusCell.classList.toggle("status-inactive", isActive);

    button.textContent = isActive ? "Enable" : "Disable";
    button.classList.toggle("disable-button", !isActive);
    button.classList.toggle("enable-button", isActive);
}

document.addEventListener("DOMContentLoaded", () => {
    const confirmYesBtn = document.getElementById("confirmYesBtn");
    if (confirmYesBtn) {
        confirmYesBtn.onclick = function () {
            if (typeof confirmCallback === "function") confirmCallback();
            closeConfirmModal();
        };
    }

    const saveButton = document.querySelector(".save-button");
    if (saveButton) {
        saveButton.onclick = function () {
            handleSaveAction();
        };
    }

    applyFilters();
});