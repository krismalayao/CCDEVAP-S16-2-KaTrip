let confirmCallback = null;
let selectedRow = null;
let filters = {
    search: ""
};

const rowsPerPage = 9;
let currentPage = 1;

function getSelectedApplicant() {
    return selectedRow;
}

function updateActionButtons() {
    const editButton = document.getElementById("editButton");
    const deleteButton = document.getElementById("deleteButton");

    if (editButton) editButton.disabled = !selectedRow;
    if (deleteButton) deleteButton.disabled = !selectedRow;
}

function selectRow(row) {
    if (selectedRow) {
        selectedRow.classList.remove("selected-row");
    }

    if (selectedRow === row) {
        // Deselect if already selected
        selectedRow = null;
        resetProfileViewer();
    } else {
        selectedRow = row;
        selectedRow.classList.add("selected-row");
        displayApplicant(selectedRow);
    }

    updateActionButtons();
}

function resetProfileViewer() {
    const profileViewer = document.getElementById("profileViewer");
    if (profileViewer) {
        profileViewer.innerHTML = `<p>Select an applicant from the table to view profile information and uploaded documents.</p>`;
    }

    const decisionButtons = document.getElementById("decisionButtons");
    if (decisionButtons) decisionButtons.style.display = "none";
}

function displayApplicant(row) {
    const profileViewer = document.getElementById("profileViewer");
    const driverId = row.dataset.driverId;

    profileViewer.innerHTML = `
        <div class="profile-box">
            <h3>User Information</h3>
            <p><strong>Name:</strong> ${row.cells[0].textContent.trim()}</p>
            <p><strong>Gender:</strong> ${row.dataset.gender.charAt(0).toUpperCase() + row.dataset.gender.slice(1)}</p>
            <p><strong>Birthdate:</strong> ${row.dataset.birthdate}</p>
            <p><strong>Phone:</strong> ${row.dataset.phone}</p>

            <hr>

            <h3>Driver Profile</h3>
            <p><strong>License Number:</strong> ${row.dataset.license}</p>
            <p><strong>Vehicle:</strong> ${row.dataset.vehicle}</p>
            <p><strong>Plate Number:</strong> ${row.dataset.plate}</p>
            <p><strong>Vehicle Color:</strong> ${row.dataset.color.charAt(0).toUpperCase() + row.dataset.color.slice(1)}</p>
            <p><strong>Status:</strong> ${row.dataset.verification.charAt(0).toUpperCase() + row.dataset.verification.slice(1)}</p>

            <hr>

            <h3>Uploaded Documents</h3>
            <p>
                <strong>Driver License:</strong> 
                ${row.dataset.licenseFile ? `<a href="#" class="document-link" data-document-url="${row.dataset.licenseFile}" data-document-title="Driver License">View File</a>` : "No File"}
            </p>
            <p>
                <strong>Vehicle Picture:</strong> 
                ${row.dataset.vehicleFile ? `<a href="#" class="document-link" data-document-url="${row.dataset.vehicleFile}" data-document-title="Vehicle Picture">View File</a>` : "No File"}
            </p>
            <p>
                <strong>Vehicle Registration:</strong> 
                ${row.dataset.registrationFile ? `<a href="#" class="document-link" data-document-url="${row.dataset.registrationFile}" data-document-title="Vehicle Registration">View File</a>` : "No File"}
            </p>
            <p>
                <strong>Vehicle Insurance:</strong> 
                ${row.dataset.insuranceFile ? `<a href="#" class="document-link" data-document-url="${row.dataset.insuranceFile}" data-document-title="Vehicle Insurance">View File</a>` : "No File"}
            </p>
        </div>
    `;

    document.getElementById("approveDriverId").value = driverId;
    document.getElementById("denyDriverId").value = driverId;

    const decisionButtons = document.getElementById("decisionButtons");
    if (decisionButtons) {
        const status = row.dataset.verification.toLowerCase();
        decisionButtons.style.display = status === "pending" ? "flex" : "none";
    }
}

function closeDocumentModal() {
    const modal = document.getElementById("documentModal");
    const image = document.getElementById("documentModalImage");
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (image) image.removeAttribute("src");
}

function openDocumentModal(url, title) {
    const modal = document.getElementById("documentModal");
    const image = document.getElementById("documentModalImage");
    const heading = document.getElementById("documentModalTitle");
    if (!modal || !image) return;

    heading.textContent = title || "Uploaded Document";
    image.src = url;
    image.alt = heading.textContent;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
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

    document.getElementById("modalTitle").textContent = "Edit Application";
    document.getElementById("formAction").value = "editDriverApplication";
    document.getElementById("driver_id").value = selected.dataset.driverId;

    const name = selected.cells[0].textContent.trim().split(" ");
    document.querySelector("input[name='first_name']").value = name[0];
    document.querySelector("input[name='last_name']").value = name.slice(1).join(" ");
    document.querySelector("input[name='birthdate']").value = selected.dataset.birthdate;
    document.querySelector("input[name='phone_number']").value = selected.dataset.phone;
    document.querySelector("input[name='email']").value = selected.dataset.email;
    document.querySelector("select[name='gender']").value = selected.dataset.gender;

    document.querySelector("input[name='license_number']").value = selected.dataset.license;
    document.querySelector("input[name='vehicle_model']").value = selected.dataset.vehicle;
    document.querySelector("input[name='plate_number']").value = selected.dataset.plate;
    document.querySelector("select[name='vehicle_color']").value = selected.dataset.color;
    document.querySelector("select[name='verification_status']").value = selected.dataset.verification;

    document.getElementById("applicationModal").classList.add("show");
}

function closeModal() {
    const modal = document.getElementById("applicationModal");
    if (modal) modal.classList.remove("show");
}

function deleteApplication() {
    const selected = getSelectedApplicant();

    if (!selected) {
        alert("Please select an applicant first.");
        return;
    }

    const name = selected.cells[0].textContent.trim();

    openConfirmModal("Confirm Delete", `Are you sure you want to delete ${name}?`, function() {
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
        ids.value = JSON.stringify([selected.dataset.driverId]);

        form.appendChild(action);
        form.appendChild(ids);
        document.body.appendChild(form);
        form.submit();
    });
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

document.addEventListener("DOMContentLoaded", () => {
    // Attach click listeners to rows for selection
    const applicantRows = document.querySelectorAll(".applicant-card");
    applicantRows.forEach(row => {
        row.addEventListener("click", () => selectRow(row));
    });

    document.addEventListener("click", (event) => {
        const documentLink = event.target.closest(".document-link");
        if (documentLink) {
            event.preventDefault();
            openDocumentModal(documentLink.dataset.documentUrl, documentLink.dataset.documentTitle);
            return;
        }

        if (event.target.id === "documentModal" || event.target.id === "documentModalBackdrop") {
            closeDocumentModal();
        }
    });

    document.getElementById("documentModalClose")?.addEventListener("click", closeDocumentModal);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeDocumentModal();
    });

    const confirmYesBtn = document.getElementById("confirmYesBtn");
    if (confirmYesBtn) {
        confirmYesBtn.onclick = function() {
            if (confirmCallback) confirmCallback();
            closeConfirmModal();
        };
    }

    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    if (message === "successfulAdd") alert("Driver application successfully added.");
    if (message === "duplicateAdd") alert("Cannot add driver. Email or phone number already exists.");
    if (message === "successfulEdit") alert("Driver application successfully edited.");
    if (message === "duplicateEdit") alert("Cannot edit driver. Email or phone number already exists.");
    if (message === "successfulApprove") alert("Driver successfully approved.");
    if (message === "successfulDeny") alert("Driver successfully denied.");
    if (message === "successfulDelete") alert("Driver application deleted.");

    if (message) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    applyFilters();
});

function searchApplicants() {
    const input = document.getElementById("searchInput");
    filters.search = input.value.toLowerCase().trim();
    currentPage = 1;
    applyFilters();
}

function applyFilters() {
    const table = document.getElementById("applicantTable");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    const allRows = Array.from(tbody.querySelectorAll(".applicant-card"));
    
    const filteredRows = allRows.filter(row => {
        const name = row.cells[0].textContent.toLowerCase();
        return name.includes(filters.search);
    });

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = 1;

    allRows.forEach(row => row.style.display = "none");

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    filteredRows.slice(start, end).forEach(row => {
        row.style.display = "";
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

    wrapper.append(prev, label, next);
    container.appendChild(wrapper);
}