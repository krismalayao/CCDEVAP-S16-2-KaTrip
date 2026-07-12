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
function viewBookings() {

    const row = getSelectedRow();

    if (!row) {
        alert("Please select a trip.");
        return;
    }

    const rideId = row.cells[1].textContent;

    fetch("../../backEnd/controller/tripManagementController.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body:
            "action=viewBookings&ride_id=" + rideId
    })

    .then(response => response.json())

    .then(bookings => {
        const body = document.getElementById("reservationBody");
        body.innerHTML = "";

        if (bookings.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="2">
                        No bookings found.
                    </td>
                </tr>
            `;
        } else {
            bookings.forEach(b => {
                body.innerHTML += `

                    <tr>
                        <td>${b.passenger}</td>
                        <td class="capitalize">${b.booking_status}</td>
                    </tr>
                `;
            });

        }

        document
            .getElementById("reservationModal")
            .classList
            .add("show");
    });
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