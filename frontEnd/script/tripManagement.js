let filters = {
    search: "",
    status: "all",
    fromTime: "",
    toTime: ""
};

const rowsPerPage = 7;
let currentPage = 1;

/* SEARCH */
function searchTrips() {
    filters.search =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    currentPage = 1;
    applyFilters();
}

/* STATUS FILTER */
function filterByStatus() {

    const status =
        document.getElementById("statusFilter")
        .value
        .toLowerCase();

    filters.status =
        status === "all status"
        ? "all"
        : status;

    currentPage = 1;
    applyFilters();
}

/* TIME FILTER */
function filterTime() {

    filters.fromTime = document.getElementById("fromTime").value;
    filters.toTime = document.getElementById("toTime").value;

    currentPage = 1;
    applyFilters();
}

/* SELECTED TRIP */
function getSelectedRow() {

    const selected =
        document.querySelector(
            "input[name='selectedTrip']:checked"
        );

    return selected
        ? selected.closest("tr")
        : null;
}

/* CHANGE STATUS */
function updateTripStatus() {

    const row = getSelectedRow();

    if (!row) {
        alert("Please select a trip.");
        return;
    }

    const rideId = row.cells[1].textContent.trim();

    document.getElementById("selectedRideId").value = rideId;
    document.getElementById("statusModal").classList.add("show");
}

function closeModal() {

    document
        .getElementById("statusModal")
        .classList
        .remove("show");
}

/* VIEW RESERVATIONS */
function viewReservations() {

    const row = getSelectedRow();

    if (!row) {
        alert("Please select a trip.");
        return;
    }

    const tripId = row.cells[1].textContent;

    const body =
        document.getElementById("reservationBody");

    body.innerHTML = "";

    const tripReservations =
        reservations[tripId] || [];

    tripReservations.forEach(r => {

        body.innerHTML += `
            <tr>
                <td>${r.passenger}</td>
                <td>${r.status}</td>
            </tr>
        `;
    });

    document
        .getElementById("reservationModal")
        .classList
        .add("show");
}

function closeReservations() {

    document
        .getElementById("reservationModal")
        .classList
        .remove("show");
}

/* FILTERS */
function applyFilters() {

    const rows =
        Array.from(
            document.querySelectorAll(
                "#tripTable tbody tr"
            )
        );

    const filtered = rows.filter(row => {

        const text =
            row.textContent.toLowerCase();

        const status =
            row.cells[7]
            .textContent
            .toLowerCase();

        const rowTime = row.dataset.time;

        const matchesSearch = text.includes(filters.search);
        const matchesStatus = filters.status === "all" || status === filters.status;
        const matchesFromTime = !filters.fromTime || rowTime >= filters.fromTime;
        const matchesToTime = !filters.toTime || rowTime <= filters.toTime;

        return matchesSearch && matchesStatus && matchesFromTime && matchesToTime;
    });

    rows.forEach(row => {
        row.style.display = "none";
    });

    const totalPages =
        Math.ceil(filtered.length / rowsPerPage) || 1;

    const start =
        (currentPage - 1) * rowsPerPage;

    filtered
        .slice(start, start + rowsPerPage)
        .forEach(row => {
            row.style.display = "";
        });

    renderPagination(totalPages);
}

/* PAGINATION */
function renderPagination(totalPages) {

    const pagination =
        document.getElementById("pagination");

    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    pagination.innerHTML = `
        <button
            ${currentPage === 1 ? "disabled" : ""}
            onclick="currentPage--;applyFilters();"
        >
            <
        </button>

        <span>
            ${currentPage} of ${totalPages}
        </span>

        <button
            ${currentPage === totalPages ? "disabled" : ""}
            onclick="currentPage++;applyFilters();"
        >
            >
        </button>
    `;
}

document.addEventListener(
    "DOMContentLoaded",
    applyFilters
);