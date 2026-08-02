let confirmCallback = null;

/* ROW SELECTION VIA HOVER & CLICK */
function selectRow(row) {
    const isSelected = row.classList.contains("selected-row");
    
    document.querySelectorAll("#tripTable tbody tr").forEach(r => r.classList.remove("selected-row"));

    if (!isSelected) {
        row.classList.add("selected-row");
    }

    updateActionButtons();
}

function getSelectedRow() {
    return document.querySelector("#tripTable tbody tr.selected-row");
}

function updateActionButtons() {
    const selectedRow = getSelectedRow();
    const editButton = document.getElementById("editButton");
    const deleteButton = document.getElementById("deleteButton");

    const hasSelection = selectedRow !== null;
    if (editButton) editButton.disabled = !hasSelection;
    if (deleteButton) deleteButton.disabled = !hasSelection;
}

/* MODAL CONTROLS */
function openAddModal() {
    const modal = document.getElementById("tripModal");
    document.getElementById("modalTitle").textContent = "Add Trip";
    document.getElementById("formAction").value = "addTrip";
    document.getElementById("tripForm").reset();
    modal.classList.add("show");
}

function openEditModal() {
    const row = getSelectedRow();

    if (!row) {
        alert("Please select a trip first.");
        return;
    }

    const modal = document.getElementById("tripModal");
    document.getElementById("modalTitle").textContent = "Edit Trip";
    document.getElementById("formAction").value = "editTrip";

    // Populate using dataset attributes for precision
    document.getElementById("ride_id").value = row.dataset.rideId;
    document.getElementById("driver_id").value = row.dataset.driverId;
    document.getElementById("origin").value = row.dataset.origin;
    document.getElementById("destination").value = row.dataset.destination;
    document.getElementById("departure_date").value = row.dataset.departureDate;
    document.getElementById("departure").value = row.dataset.departure;
    document.getElementById("total_seats").value = row.dataset.totalSeats;
    document.getElementById("available_seats").value = row.dataset.availableSeats;
    document.getElementById("cost").value = row.dataset.cost;
    document.getElementById("ride_status").value = row.dataset.status;

    modal.classList.add("show");
}

function closeModal() {
    const modal = document.getElementById("tripModal");
    if (modal) modal.classList.remove("show");
}

/* CONFIRM DELETE MODAL */
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

function deleteTrip() {
    const selectedRow = getSelectedRow();

    if (!selectedRow) {
        alert("Please select a trip first.");
        return;
    }

    const rideId = selectedRow.dataset.rideId;
    const message = `Are you sure you want to delete Trip ID: ${rideId}?`;

    openConfirmModal("Confirm Delete", message, function() {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "../../backEnd/controller/tripManagementController.php";

        const actionInput = document.createElement("input");
        actionInput.type = "hidden";
        actionInput.name = "action";
        actionInput.value = "deleteTrip";

        const idInput = document.createElement("input");
        idInput.type = "hidden";
        idInput.name = "ride_id";
        idInput.value = rideId;

        form.appendChild(actionInput);
        form.appendChild(idInput);

        document.body.appendChild(form);
        form.submit();
    });
}

/* CORE FILTER SYSTEM */
let filters = {
    search: "",
    status: "all",
    from: "",
    to: ""
};

const rowsPerPage = 10;
let currentPage = 1;

function searchTrips() {
    const searchInput = document.getElementById("searchInput");
    filters.search = searchInput ? searchInput.value.toLowerCase().trim() : "";
    currentPage = 1;
    applyFilters();
}

function filterByStatus() {
    const statusSelect = document.getElementById("statusFilter");
    if (statusSelect) {
        const statusValue = statusSelect.value.toLowerCase().trim();
        filters.status = (statusValue === "all" || statusValue === "all status") ? "all" : statusValue;
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
    const table = document.getElementById("tripTable");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const allRows = Array.from(tbody.querySelectorAll("tr"));

    const filteredRows = allRows.filter(row => {
        if (!row.cells || row.cells.length < 7) return false;

        const driverText = row.cells[1].textContent.toLowerCase();
        const originText = row.cells[2].textContent.toLowerCase();
        const destText = row.cells[3].textContent.toLowerCase();

        const matchesSearch = driverText.includes(filters.search) || 
                              originText.includes(filters.search) || 
                              destText.includes(filters.search);

        const status = row.dataset.status ? row.dataset.status.toLowerCase() : "";
        const matchesStatus = (filters.status === "all" || status === filters.status);

        const rowDate = row.dataset.departureDate || "";
        let matchesDateFrom = true;
        let matchesDateTo = true;

        if (filters.from) matchesDateFrom = (rowDate >= filters.from);
        if (filters.to)   matchesDateTo = (rowDate <= filters.to);

        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
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

    if (message === "duplicateAdd") alert("Cannot add trip, a duplicate schedule already exists for this driver.");
    if (message === "duplicateEdit") alert("Cannot edit trip, a duplicate schedule conflicts with another trip.");
    if (message === "successfulAdd") alert("Trip successfully added.");
    if (message === "successfulEdit") alert("Trip successfully edited.");

    if (message) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});