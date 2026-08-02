let confirmCallback = null;

/* ROW SELECTION VIA HOVER & CLICK */
function selectRow(row) {
    const isSelected = row.classList.contains("selected-row");
    
    // Clear selection from all rows
    document.querySelectorAll("#userTable tbody tr").forEach(r => r.classList.remove("selected-row"));

    // Toggle selection on clicked row
    if (!isSelected) {
        row.classList.add("selected-row");
    }

    updateActionButtons();
}

function getSelectedRow() {
    return document.querySelector("#userTable tbody tr.selected-row");
}

function updateActionButtons() {
    const selectedRow = getSelectedRow();
    const editButton = document.getElementById("editButton");
    const deleteButton = document.getElementById("deleteButton");

    const hasSelection = selectedRow !== null;
    if (editButton) editButton.disabled = !hasSelection;
    if (deleteButton) deleteButton.disabled = !hasSelection;
}

/* MODAL CONTROL */
function openAddModal() {
    const modal = document.getElementById("userModal");
    document.getElementById("modalTitle").textContent = "Add User";
    document.getElementById("formAction").value = "addUser";
    document.getElementById("userForm").reset();
    modal.classList.add("show");
}

function openEditModal() {
    const row = getSelectedRow();

    if (!row) {
        alert("Please select a user first.");
        return;
    }

    const modal = document.getElementById("userModal");
    document.getElementById("modalTitle").textContent = "Edit User";
    document.getElementById("formAction").value = "editUser";

    const cells = row.cells;
    document.getElementById("user_id").value = cells[0].textContent.trim();

    let fullName = cells[1].textContent.trim().split(" ");
    document.querySelector("input[name='first_name']").value = fullName[0];
    document.querySelector("input[name='last_name']").value = fullName.slice(1).join(" ");

    document.querySelector("input[name='email']").value = cells[2].textContent.trim();
    document.querySelector("#role").value = cells[3].textContent.trim().toLowerCase();
    document.querySelector("select[name='status']").value = cells[4].textContent.trim().toLowerCase();

    document.querySelector("#gender").value = row.dataset.gender;
    document.querySelector("#birthdate").value = row.dataset.birthdate;
    document.querySelector("#phone_number").value = row.dataset.phone;

    modal.classList.add("show");
}

function closeModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.classList.remove("show");
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

function deleteUser() {
    const selectedRow = getSelectedRow();

    if (!selectedRow) {
        alert("Please select a user first.");
        return;
    }

    const userId = selectedRow.cells[0].textContent.trim();
    const userName = selectedRow.cells[1].textContent.trim();
    const message = `Are you sure you want to delete ${userName}?`;

    openConfirmModal("Confirm Delete", message, function() {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "../../backEnd/controller/userManagementController.php";

        const actionInput = document.createElement("input");
        actionInput.type = "hidden";
        actionInput.name = "action";
        actionInput.value = "deleteUser";

        const idInput = document.createElement("input");
        idInput.type = "hidden";
        idInput.name = "user_id";
        idInput.value = userId;

        form.appendChild(actionInput);
        form.appendChild(idInput);

        document.body.appendChild(form);
        form.submit();
    });
}

/* CORE FILTER SYSTEM FOR STATIC */
let filters = {
    search: "",
    role: "all",
    from: "",
    to: ""
};

const rowsPerPage = 10;
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
        filters.role = (roleValue === "all" || roleValue === "all roles") ? "all" : roleValue;
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

        const nameText = row.cells[1].textContent.toLowerCase();
        const emailText = row.cells[2].textContent.toLowerCase();
        const matchesSearch = nameText.includes(filters.search) || emailText.includes(filters.search);

        const role = row.cells[3].textContent.trim().toLowerCase();
        const matchesRole = (filters.role === "all" || role === filters.role);

        const rowDate = row.cells[5].dataset.date || "";
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

document.addEventListener("DOMContentLoaded", () => {
    const confirmYesBtn = document.getElementById("confirmYesBtn");
    if (confirmYesBtn) {
        confirmYesBtn.onclick = function () {
            if (typeof confirmCallback === "function") confirmCallback();
            closeConfirmModal();
        };
    }

    applyFilters();

    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    if (message === "duplicateAdd") alert("Cannot add user, the email or phone number already exists.");
    if (message === "duplicateEdit") alert("Cannot edit user, the email or phone number already exists.");
    if (message === "successfulAdd") alert("User successfully added.");
    if (message === "successfulEdit") alert("User successfully edited.");

    if (message) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});