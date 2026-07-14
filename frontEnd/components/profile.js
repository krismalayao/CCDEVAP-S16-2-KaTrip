document.addEventListener("DOMContentLoaded", () => {
    const endpoint = "../../backEnd/controller/profileController.php";
    const isDriverProfile = document.body.classList.contains("driver-profile-body");
    const saveButton = document.getElementById("profile-save-btn");
    let uploadCsrfToken = "";
    const fields = {
        name: document.getElementById("profile-name"),
        phone: document.getElementById("profile-phone"),
        email: document.getElementById("profile-email"),
        password: document.getElementById("profile-password"),
        gender: document.getElementById("profile-gender"),
        createdAt: document.getElementById("profile-created-at"),
        vehicleModel: document.getElementById("profile-vehicle-model"),
        plateNumber: document.getElementById("profile-license-plate"),
        status: document.getElementById("profile-status")
    };

    const showMessage = (message, isError = false) => {
        let element = document.getElementById("profile-save-message");
        if (!element && saveButton) {
            element = document.createElement("p");
            element.id = "profile-save-message";
            element.setAttribute("role", "status");
            saveButton.parentElement.appendChild(element);
        }
        if (!element) return;
        element.textContent = message;
        element.style.cssText = `color:${isError ? "#b42318" : "#277a3d"};font-size:12px;font-weight:bold;margin:8px 0 0;`;
    };

    const showSuccessModal = (title = "Profile saved successfully") => {
        let modal = document.getElementById("profile-save-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "profile-save-modal";
            modal.className = "profile-save-modal";
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-modal", "true");
            modal.setAttribute("aria-labelledby", "profile-save-modal-title");
            modal.innerHTML = `
                <div class="profile-save-modal-card">
                    <h3 id="profile-save-modal-title"></h3>
                    <button type="button" class="profile-save-modal-ok">OK</button>
                </div>`;
            document.body.appendChild(modal);
            modal.querySelector(".profile-save-modal-ok").addEventListener("click", () => {
                modal.classList.remove("show");
            });
        }
        modal.querySelector("#profile-save-modal-title").textContent = title;
        modal.classList.add("show");
        modal.querySelector(".profile-save-modal-ok").focus();
    };

    const populateProfile = (profile) => {
        if (fields.name) fields.name.textContent = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "KaTrip User";
        const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "K";
        document.querySelectorAll(".nav-profile-initials").forEach((element) => {
            element.textContent = initials;
        });
        const avatarPreview = document.getElementById("avatar-preview");
        if (avatarPreview && profile.profile_picture_url) {
            avatarPreview.style.backgroundImage = `url('${profile.profile_picture_url}&v=${Date.now()}')`;
            avatarPreview.style.backgroundSize = "cover";
            avatarPreview.style.backgroundPosition = "center";
        }
        if (fields.phone) fields.phone.value = profile.phone_number || "";
        if (fields.email) fields.email.value = profile.email || "";
        if (fields.gender) fields.gender.value = (profile.gender || "").replaceAll("-", "_");
        if (fields.createdAt) {
            const created = new Date(profile.created_at);
            fields.createdAt.textContent = Number.isNaN(created.getTime()) ? "Created date unavailable" : `Created at ${created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`;
        }
        if (isDriverProfile) {
            if (fields.vehicleModel) fields.vehicleModel.value = profile.vehicle_model || "";
            if (fields.plateNumber) fields.plateNumber.value = profile.plate_number || "";
            if (fields.status) {
                const status = profile.verification_status || "pending";
                fields.status.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                const statusIcon = fields.status.nextElementSibling;
                if (statusIcon) statusIcon.hidden = status !== "verified";
            }
        }
    };

    const loadProfile = async () => {
        try {
            const response = await fetch(endpoint, { credentials: "same-origin" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to load profile.");
            uploadCsrfToken = data.csrf_token || uploadCsrfToken;
            populateProfile(data.profile);
        } catch (error) {
            if (fields.name) fields.name.textContent = "Unable to load profile";
            showMessage(error.message, true);
        }
    };

    saveButton?.addEventListener("click", async () => {
        const formData = new FormData();
        formData.append("phone", fields.phone?.value.trim() || "");
        formData.append("email", fields.email?.value.trim() || "");
        formData.append("gender", fields.gender?.value || "");
        formData.append("password", fields.password?.value || "");
        if (isDriverProfile) {
            formData.append("vehicle_model", fields.vehicleModel?.value.trim() || "");
            formData.append("plate_number", fields.plateNumber?.value.trim() || "");
        }

        saveButton.disabled = true;
        try {
            const response = await fetch(endpoint, { method: "POST", body: formData, credentials: "same-origin" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to save profile.");
            populateProfile(data.profile);
            if (fields.password) fields.password.value = "";
            showSuccessModal();
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            saveButton.disabled = false;
        }
    });

    document.querySelectorAll(".profile-field-edit-btn").forEach((button) => {
        button.addEventListener("click", () => button.previousElementSibling?.focus());
    });

    const avatarUpload = document.getElementById("avatar-upload");
    const avatarPreview = document.getElementById("avatar-preview");
    avatarUpload?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file || !avatarPreview) return;
        const formData = new FormData();
        formData.append("profile_picture", file);
        try {
            const response = await fetch("../../backEnd/controller/uploadProfilePicture.php", {
                method: "POST",
                credentials: "same-origin",
                headers: { "X-CSRF-Token": uploadCsrfToken },
                body: formData
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to upload profile picture.");
            avatarPreview.style.backgroundImage = `url('${data.url}&v=${Date.now()}')`;
            avatarPreview.style.backgroundSize = "cover";
            avatarPreview.style.backgroundPosition = "center";
            showSuccessModal("Profile picture updated successfully");
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            avatarUpload.value = "";
        }
    });

    document.getElementById("logout-btn")?.addEventListener("click", async () => {
        try {
            await fetch("../../backEnd/controller/logoutController.php", { method: "POST", credentials: "same-origin" });
        } finally {
            localStorage.removeItem("authToken");
            sessionStorage.clear();
            window.location.href = "../public/loginPage.php";
        }
    });

    loadProfile();
});
