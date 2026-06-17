const reservations = {
    T001: [
        { passenger: "Juan Dela Cruz", status: "Confirmed" },
        { passenger: "Anna Lopez", status: "Confirmed" },
        { passenger: "Grace Bautista", status: "Pending" }
    ],

    T002: [
        { passenger: "Kevin Yu", status: "Confirmed" },
        { passenger: "Sarah Lim", status: "Confirmed" }
    ]
};

let filters = {
    search: "",
    status: "all",
    from: "",
    to: ""
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

/* DATE FILTER */
function filterDates() {

    filters.from =
        document.getElementById("fromDate").value;

    filters.to =
        document.getElementById("toDate").value;

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

    document
        .getElementById("statusModal")
        .classList
        .add("show");
}

function closeModal() {

    document
        .getElementById("statusModal")
        .classList
        .remove("show");
}

function saveStatus() {

    const row = getSelectedRow();

    if (!row) return;

    const status =
        document.getElementById("tripStatus").value;

    const cell = row.cells[7];

    cell.textContent = status;

    cell.className =
        "status-" + status.toLowerCase();

    closeModal();
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

        const rowDate =
            row.dataset.date;

        const matchesSearch =
            text.includes(filters.search);

        const matchesStatus =
            filters.status === "all" ||
            status === filters.status;

        const matchesFrom =
            !filters.from ||
            rowDate >= filters.from;

        const matchesTo =
            !filters.to ||
            rowDate <= filters.to;

        return matchesSearch &&
               matchesStatus &&
               matchesFrom &&
               matchesTo;
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