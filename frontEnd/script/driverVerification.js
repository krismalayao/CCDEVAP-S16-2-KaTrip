const driverApplications = {
    "U002": {
        user_id: "U002",
        first_name: "Maria",
        last_name: "Santos",
        gender: "Female",
        phone_number: "0917-123-4567",
        email: "maria@email.com",
        driver_profile: {
            license_number: "DL12345678",
            vehicle_model: "Toyota Vios",
            plate_number: "ABC1234",
            verification_status: "Pending"
        },
        documents: {
            license: "../uploads/U002/license.pdf",
            registration: "../uploads/U002/registration.pdf",
            insurance: "../uploads/U002/insurance.pdf"
        }
    },
    "U005": {
        user_id: "U005",
        first_name: "Mark",
        last_name: "Cruz",
        gender: "Male",
        phone_number: "0917-987-6543",
        email: "mark@email.com",
        driver_profile: {
            license_number: "DL87654321",
            vehicle_model: "Honda City",
            plate_number: "XYZ5678",
            verification_status: "Pending"
        },
        documents: {
            license: "../uploads/U005/license.pdf",
            registration: "../uploads/U005/registration.pdf",
            insurance: "../uploads/U005/insurance.pdf"
        }
    },
    "U006": {
        user_id: "U006",
        first_name: "Juan",
        last_name: "Dela Cruz",
        gender: "Male",
        phone_number: "0918-555-0199",
        email: "juan.delacruz@email.com",
        driver_profile: {
            license_number: "DL55566778",
            vehicle_model: "Mitsubishi Mirage",
            plate_number: "NVD9876",
            verification_status: "Verified"
        },
        documents: {
            license: "../uploads/U006/license.pdf",
            registration: "../uploads/U006/registration.pdf",
            insurance: "../uploads/U006/insurance.pdf"
        }
    },
    "U007": {
        user_id: "U007",
        first_name: "Anna",
        last_name: "Reyes",
        gender: "Female",
        phone_number: "0922-444-0288",
        email: "anna.reyes@email.com",
        driver_profile: {
            license_number: "DL99988776",
            vehicle_model: "Hyundai Accent",
            plate_number: "WQR4321",
            verification_status: "Pending"
        },
        documents: {
            license: "../uploads/U007/license.pdf",
            registration: "../uploads/U007/registration.pdf",
            insurance: "../uploads/U007/insurance.pdf"
        }
    },
    "U008": {
        user_id: "U008",
        first_name: "David",
        last_name: "Tan",
        gender: "Male",
        phone_number: "0915-333-0377",
        email: "david.tan@email.com",
        driver_profile: {
            license_number: "DL44455566",
            vehicle_model: "Nissan Almera",
            plate_number: "TSA8899",
            verification_status: "Rejected"
        },
        documents: {
            license: "../uploads/U008/license.pdf",
            registration: "../uploads/U008/registration.pdf",
            insurance: "../uploads/U008/insurance.pdf"
        }
    }
};

let selectedApplicant = null;
let selectedApplicationId = null;
let confirmCallback = null;

function selectApplicant(id, event) {
    selectedApplicant = id;
    const applicant = driverApplications[id];

    if (!applicant) {
        console.error("Applicant not found:", id);
        return;
    }

    document.querySelectorAll(".applicant-card").forEach(card => card.classList.remove("active"));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
        
        const radio = event.currentTarget.querySelector("input[name='selectedApplicant']");
        if (radio) radio.checked = true;
    }

    renderApplicant(applicant);
}

function renderApplicant(applicant) {
    const profileViewer = document.getElementById("profileViewer");

    profileViewer.innerHTML = `
        <div class="profile-box">
            <br /><h3>User Information</h3>
            <p><strong>User ID:</strong> ${applicant.user_id}</p>
            <p><strong>Full Name:</strong> ${applicant.first_name} ${applicant.last_name}</p>
            <p><strong>Gender:</strong> ${applicant.gender}</p>
            <p><strong>Phone Number:</strong> ${applicant.phone_number}</p>
            <p><strong>Email:</strong> ${applicant.email}</p>
            <hr />
            <h3>Driver Profile</h3>
            <p><strong>License Number:</strong> ${applicant.driver_profile.license_number}</p>
            <p><strong>Vehicle Model:</strong> ${applicant.driver_profile.vehicle_model}</p>
            <p><strong>Plate Number:</strong> ${applicant.driver_profile.plate_number}</p>
            <p><strong>Status:</strong> ${applicant.driver_profile.verification_status}</p>
            <hr />
            <h3>Uploaded Documents</h3>
            <p><strong>Driver's License:</strong> <a href="${applicant.documents.license}" target="_blank">View File</a></p>
            <p><strong>Vehicle Registration:</strong> <a href="${applicant.documents.registration}" target="_blank">View File</a></p>
            <p><strong>Vehicle Insurance:</strong> <a href="${applicant.documents.insurance}" target="_blank">View File</a></p>
        </div>
    `;

    const decisionButtons = document.getElementById("decisionButtons");
    if (decisionButtons) {
        decisionButtons.style.display = "flex";
    }
}

function approveApplicant() {
    if (!selectedApplicant) {
        alert("Please select an applicant first.");
        return;
    }

    const applicant = driverApplications[selectedApplicant];
    applicant.driver_profile.verification_status = "Verified";

    renderApplicant(applicant);
    updateTableStatus(selectedApplicant, "Verified", "status-verified");

    alert(`${applicant.first_name} ${applicant.last_name} has been approved.`);
}

function rejectApplicant() {
    if (!selectedApplicant) {
        alert("Please select an applicant first.");
        return;
    }

    const applicant = driverApplications[selectedApplicant];
    applicant.driver_profile.verification_status = "Rejected";

    renderApplicant(applicant);
    updateTableStatus(selectedApplicant, "Rejected", "status-rejected");

    alert(`${applicant.first_name} ${applicant.last_name} has been rejected.`);
}

function updateTableStatus(id, statusText, newClassName) {
    const row = document.querySelector(`tr.applicant-card[onclick*='${id}']`);
    
    if (row) {
        const statusCell = row.cells[2]; 
        
        if (statusCell) {
            statusCell.textContent = statusText;
            statusCell.className = ""; 
            statusCell.classList.add(newClassName);
        }
    }
}

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

const statusFilter = document.getElementById("statusFilter");
if (statusFilter) {
    statusFilter.addEventListener("change", function () {
        const selectedStatus = this.value.toLowerCase(); 

        document.querySelectorAll(".applicant-card").forEach(card => {
            if (selectedStatus === "all") {
                card.style.display = "";
                return; 
            }

            const onclickAttr = card.getAttribute("onclick");
            if (!onclickAttr) return;
            
            const id = onclickAttr.match(/'([^']+)'/)[1];
            const applicant = driverApplications[id];

            if (!applicant) {
                card.style.display = "none";
                return;
            }

            const currentStatus = applicant.driver_profile.verification_status.toLowerCase();

            if (currentStatus === selectedStatus) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });
}

function getSelectedApplicant() {
    const selected = document.querySelector("input[name='selectedApplicant']:checked");
    if (!selected) {
        alert("Please select an applicant.");
        return null;
    }
    return selected.value;
}

function openAddModal() {
    document.getElementById("modalTitle").textContent = "Add Application";
    clearModal();
    document.getElementById("applicationModal").classList.add("show");
    selectedApplicationId = null;
}

function openEditModal() {
    const id = getSelectedApplicant();
    if (!id) return;

    const data = driverApplications[id];
    if (!data) return;

    selectedApplicationId = id;
    document.getElementById("modalTitle").textContent = "Edit Application";
    document.getElementById("firstName").value = data.first_name;
    document.getElementById("lastName").value = data.last_name;
    document.getElementById("gender").value = data.gender;
    document.getElementById("phoneNumber").value = data.phone_number;
    document.getElementById("email").value = data.email;
    document.getElementById("licenseNumber").value = data.driver_profile.license_number;
    document.getElementById("vehicleModel").value = data.driver_profile.vehicle_model;
    document.getElementById("plateNumber").value = data.driver_profile.plate_number;
    document.getElementById("applicationModal").classList.add("show");
}

function closeModal() {
    document.getElementById("applicationModal").classList.remove("show");
}

function clearModal() {
    document.querySelectorAll("#applicationModal input").forEach(input => input.value = "");
    document.getElementById("gender").selectedIndex = 0;
}

function saveApplication() {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const gender = document.getElementById("gender").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const licenseNumber = document.getElementById("licenseNumber").value;
    const vehicleModel = document.getElementById("vehicleModel").value;
    const plateNumber = document.getElementById("plateNumber").value;
    const verificationStatus = document.getElementById("verificationStatus").value;

    if (!firstName || !lastName || !email) {
        alert("Please fill out at least Name and Email fields.");
        return;
    }

    const idToUpdate = selectedApplicationId || selectedApplicant;

    if (idToUpdate) {
        const app = driverApplications[idToUpdate];

        app.first_name = firstName;
        app.last_name = lastName;
        app.gender = gender;
        app.phone_number = phoneNumber;
        app.email = email;
        app.driver_profile.license_number = licenseNumber;
        app.driver_profile.vehicle_model = vehicleModel;
        app.driver_profile.plate_number = plateNumber;
        app.driver_profile.verification_status = verificationStatus;

        renderApplicant(app);

        const row = document.querySelector(`tr.applicant-card[onclick*='${idToUpdate}']`);
        if (row) {
            row.cells[1].textContent = `${firstName} ${lastName}`;
            row.cells[2].textContent = verificationStatus;
            row.cells[2].className = ""; 
            row.cells[2].classList.add(`status-${verificationStatus.toLowerCase()}`);
        }

    } else {
        const newId = "U" + String(Object.keys(driverApplications).length + 3).padStart(3, '0');

        driverApplications[newId] = {
            user_id: newId,
            first_name: firstName,
            last_name: lastName,
            gender: gender,
            phone_number: phoneNumber,
            email: email,
            driver_profile: {
                license_number: licenseNumber,
                vehicle_model: vehicleModel,
                plate_number: plateNumber,
                verification_status: verificationStatus
            },
            documents: { license: "#", registration: "#", insurance: "#" }
        };

        const tableBody = document.querySelector("#applicantTable tbody");
        if (tableBody) {
            const newRow = document.createElement("tr");
            newRow.className = "applicant-card";
            newRow.setAttribute("onclick", `selectApplicant('${newId}', event)`);
            
            const today = new Date().toLocaleDateString('en-US', {
                month: '2-digit', day: '2-digit', year: 'numeric'
            });

            newRow.innerHTML = `
                <td><input type="radio" name="selectedApplicant" value="${newId}" autocomplete="off"></td>
                <td>${firstName} ${lastName}</td>
                <td class="status-${verificationStatus.toLowerCase()}">${verificationStatus}</td>
                <td>${today}</td>
            `;
            tableBody.appendChild(newRow);
        }
    }

    closeModal();
    clearModal();
}

function deleteApplication() {
    const id = getSelectedApplicant();

    if (!id) return;

    openConfirmModal(
        "Delete Application",
        "Are you sure you want to delete this application?",
        () => {
            delete driverApplications[id];

            const row = document.querySelector(`tr.applicant-card[onclick*='${id}']`);
            if (row) {
                row.remove();
            }

            document.getElementById("profileViewer").innerHTML = `
                <p>Select an applicant from the table to view profile information and uploaded documents.</p>
            `;
            document.getElementById("decisionButtons").style.display = "none";
            selectedApplicant = null;
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

window.addEventListener("DOMContentLoaded", () => {
    selectedApplicant = null;

    document.querySelectorAll("input[name='selectedApplicant']").forEach(radio => {
        radio.checked = false;
    });

    const decisionButtons = document.getElementById("decisionButtons");
    if (decisionButtons) {
        decisionButtons.style.display = "none";
    }

    const profileViewer = document.getElementById("profileViewer");
    if (profileViewer) {
        profileViewer.innerHTML = `
            <p style="color: var(--grey-text); text-align: center; margin-top: 20px;">
                Select an applicant from the table to view profile information and uploaded documents.
            </p>
        `;
    }
});