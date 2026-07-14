let confirmCallback = null;
let filters = {
    search: "",
    status: "all"
};

const rowsPerPage = 9;
let currentPage = 1;

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("keyup", function () {
        const searchValue = this.value.toLowerCase();
        document.querySelectorAll(".applicant-card").forEach(card => {
            const name = card.textContent.toLowerCase();
            card.style.display = name.includes(searchValue) ? "" : "none";
        });
    });
}

function getSelectedApplicant() {
    return document.querySelector(".selectedApplicant:checked");
}

function updateActionButtons() {
    const selected = getSelectedApplicant();
    const editButton = document.getElementById("editButton");
    const deleteButton = document.getElementById("deleteButton");

    if (editButton) {
        editButton.disabled = !selected;
    }

    if (deleteButton) {
        deleteButton.disabled = !selected;
    }
}

function displayApplicant(row){
    const profileViewer = document.getElementById("profileViewer");

    profileViewer.innerHTML = `
        <div class="profile-box">
            <h3>User Information</h3>
            <p>
                <strong>Name:</strong>
                ${row.cells[1].textContent}
            </p>
            <p>
                <strong>Gender:</strong>
                ${row.dataset.gender.charAt(0).toUpperCase() + row.dataset.gender.slice(1)}
            </p>
            <p>
                <strong>Birthdate:</strong>
                ${row.dataset.birthdate}
            </p>
            <p>
                <strong>Phone:</strong>
                ${row.dataset.phone}
            </p>

            <hr>

            <h3>Driver Profile</h3>
            <p>
                <strong>License Number:</strong>
                ${row.dataset.license}
            </p>
            <p>
                <strong>Vehicle:</strong>
                ${row.dataset.vehicle}
            </p>
            <p>
                <strong>Plate Number:</strong>
                ${row.dataset.plate}
            </p>
            <p>
                <strong>Vehicle Color:</strong>
                ${row.dataset.color.charAt(0).toUpperCase() + row.dataset.color.slice(1)}
            </p>
            <p>
                <strong>Status:</strong>
                ${row.dataset.verification.charAt(0).toUpperCase() + row.dataset.verification.slice(1)}
            </p>

            <hr>

            <h3>Uploaded Documents</h3>
            <p>
                <strong>Driver License:</strong>
                ${
                    row.dataset.licenseFile 
                    ? `<a href="${row.dataset.licenseFile}" target="_blank">View File</a>`
                    : "No File"
                }
            </p>
            <p>
                <strong>Vehicle Registration:</strong>
                ${
                    row.dataset.registrationFile 
                    ? `<a href="${row.dataset.registrationFile}" target="_blank">View File</a>`
                    : "No File"
                }
            </p>
            <p>
                <strong>Vehicle Insurance:</strong>
                ${
                    row.dataset.insuranceFile
                    ? `<a href="${row.dataset.insuranceFile}" target="_blank">View File</a>`
                    : "No File"
                }
            </p>
        </div>
    `;

    document.getElementById("approveDriverId").value = row.querySelector(".selectedApplicant").value;
    document.getElementById("denyDriverId").value = row.querySelector(".selectedApplicant").value;
}

function openAddModal() {
    const modal = document.getElementById("applicationModal");

    document.getElementById("modalTitle").textContent = "Add Application";
    document.getElementById("formAction").value = "addDriverApplication";
    
    document.querySelector(".modal-content").reset();
    document.getElementById("driver_id").value = "";

    document.getElementById("verificationStatus").value = "pending";
    modal.classList.add("show");
}

function openEditModal() {
    const selected = getSelectedApplicant();

    if (!selected) {
        alert("Please select an applicant first.");
        return;
    }

    const row = selected.closest("tr");

    document.getElementById("modalTitle").textContent = "Edit Application";
    document.getElementById("formAction").value = "editDriverApplication";
    
    document.getElementById("driver_id").value = selected.value;

    const name = row.cells[1].textContent.trim().split(" ");
    document.querySelector("input[name='first_name']").value = name[0];
    document.querySelector("input[name='last_name']").value = name.slice(1).join(" ");
    document.querySelector("input[name='birthdate']").value = row.dataset.birthdate;
    document.querySelector("input[name='phone_number']").value = row.dataset.phone;
    document.querySelector("input[name='email']").value = row.dataset.email;
    document.querySelector("select[name='gender']").value = row.dataset.gender;

    document.querySelector("input[name='license_number']").value = row.dataset.license;
    document.querySelector("input[name='vehicle_model']").value = row.dataset.vehicle;
    document.querySelector("input[name='plate_number']").value = row.dataset.plate;
    document.querySelector("select[name='vehicle_color']").value = row.dataset.color;
    document.querySelector("select[name='verification_status']").value = row.dataset.verification;

    document.getElementById("applicationModal").classList.add("show");
}

function closeModal() {
    const modal = document.getElementById("applicationModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function clearModal() {
    document.querySelectorAll("#applicationModal input").forEach(input => input.value = "");
    document.getElementById("select[name='gender']").selectedIndex = 0;
}

function deleteApplication() {
    const selected = getSelectedApplicant();

    if (!selected) {
        alert("Please select an applicant first.");
        return;
    }

    const row = selected.closest("tr");
    const name = row.cells[1].textContent.trim();

    openConfirmModal("Confirm Delete", `Are you sure you want to delete ${name}?`,
        function() {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "../../backEnd/controller/driverVerificationController.php";

            const action = document.createElement("input");
            action.type = "hidden";
            action.name = "action";
            action.value = "deleteDriverApplication";

            const ids = document.createElement("input");
            ids.type = "hidden";
            ids.name = "driver_ids";
            ids.value = JSON.stringify([selected.value]);

            form.appendChild(action);
            form.appendChild(ids);
            document.body.appendChild(form);
            form.submit();
        }
    );
}

function openConfirmModal(title, message, callback) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    confirmCallback = callback;
    document.getElementById("confirmModal").classList.add("show");
}

function closeConfirmModal() {
    document.getElementById("confirmModal").classList.remove("show");
    confirmCallback = null;
}

function handleConfirmYes() {
    if (confirmCallback) {
        confirmCallback(); 
    }
    closeConfirmModal();
}

document.addEventListener("DOMContentLoaded",()=>{
    const radios = document.querySelectorAll(".selectedApplicant");

    radios.forEach(radio=>{
        radio.addEventListener("change",()=>{
            const row = radio.closest("tr");
            displayApplicant(row);
            updateActionButtons();
        });
    });

    const confirmYesBtn = document.getElementById("confirmYesBtn");

    if (confirmYesBtn) {
        confirmYesBtn.onclick=function(){
            if (confirmCallback) {
                confirmCallback();
            }

            closeConfirmModal();
        };
    }

    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    if (message === "successfulAdd") {
        alert("Driver application successfully added.");
    }

    if (message === "duplicateAdd") {
        alert("Cannot add driver. Email or phone number already exists.");
    }

    if (message === "successfulEdit") {
        alert("Driver application successfully edited.");
    }

    if (message === "duplicateEdit") {
        alert("Cannot edit driver. Email or phone number already exists.");
    }

    if(message === "successfulApprove") {
        alert("Driver successfully approved.");
    }

    if (message === "successfulDeny") {
        alert("Driver successfully denied.");
    }

    if (message === "successfulDelete") {
        alert("Driver application deleted.");
    }

    if (message) {
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }

    applyFilters();
});

function searchApplicants() {
    const input = document.getElementById("searchInput");

    filters.search = input.value.toLowerCase().trim();

    currentPage = 1;
    applyFilters();
}

function filterApplicants() {
    const select = document.getElementById("statusFilter");

    filters.status = select.value.toLowerCase();

    currentPage = 1;
    applyFilters();
}

function applyFilters() {
    const table = document.getElementById("applicantTable");

    if (!table) return;

    const tbody = table.querySelector("tbody");
    const allRows = Array.from(tbody.querySelectorAll(".applicant-card"));
    
    const filteredRows = allRows.filter(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const matchesSearch = name.includes(filters.search);
        const status = row.dataset.verification.toLowerCase();
        const matchesStatus = filters.status === "all" || status === filters.status;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = 1;
    }

    // Hide everything first
    allRows.forEach(row => {
        row.style.display = "none";
    });

    // Show current page only
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    filteredRows.slice(start,end).forEach(row=>{
        row.style.display="";
    });

    renderPagination(totalPages);
}

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

    wrapper.append(prev,label,next);
    container.appendChild(wrapper);
}