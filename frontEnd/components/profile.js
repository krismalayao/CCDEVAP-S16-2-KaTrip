document.addEventListener("DOMContentLoaded", () => {
    const endpoint = "../../backEnd/controller/profileController.php";
    const securityEndpoint = "../../backEnd/controller/accountSecurityController.php";
    const isDriverProfile = document.body.classList.contains("driver-profile-body");
    const saveButton = document.getElementById("profile-save-btn");
    const themeToggle = document.getElementById("theme-toggle-checkbox");

    const applyProfileTheme = (theme) => {
        const isDark = theme === "dark";
        document.documentElement.dataset.theme = isDark ? "dark" : "light";
        if (themeToggle) {
            themeToggle.checked = isDark;
            themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        }
    };

    applyProfileTheme(localStorage.getItem("katrip-theme") || "light");

    themeToggle?.addEventListener("change", () => {
        const nextTheme = themeToggle.checked ? "dark" : "light";
        localStorage.setItem("katrip-theme", nextTheme);
        applyProfileTheme(nextTheme);

        const themeData = new FormData();
        themeData.append("theme_only", "1");
        themeData.append("theme_preference", nextTheme);
        fetch(endpoint, { method: "POST", body: themeData, credentials: "same-origin" }).catch(() => {});
    });

    const fields = {
        name: document.getElementById("profile-name"),
        phone: document.getElementById("profile-phone"),
        email: document.getElementById("profile-email"),
        password: document.getElementById("profile-password"),
        gender: document.getElementById("profile-gender"),
        createdAt: document.getElementById("profile-created-at"),
        vehicleModel: document.getElementById("profile-vehicle-model"),
        plateNumber: document.getElementById("profile-license-plate"),
        vehicleColor: document.getElementById("profile-vehicle-color"),
        showFullName: document.getElementById("profile-show-full-name")
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

    let emailModal = null;
    const setEmailModalMessage = (message = "", isError = false) => {
        const messageElement = emailModal?.querySelector(".profile-email-modal-message");
        if (!messageElement) return;
        messageElement.textContent = message;
        messageElement.classList.toggle("error", isError);
    };

    const closeEmailModal = () => {
        if (!emailModal) return;
        emailModal.classList.remove("show");
        emailModal.setAttribute("aria-hidden", "true");
    };

    const showEmailRequestStep = () => {
        emailModal?.querySelector(".profile-email-step-request")?.removeAttribute("hidden");
        emailModal?.querySelector(".profile-email-step-verify")?.setAttribute("hidden", "");
        setEmailModalMessage();
    };

    const ensureEmailModal = () => {
        if (emailModal) return emailModal;

        emailModal = document.createElement("div");
        emailModal.id = "profile-email-modal";
        emailModal.className = "profile-email-modal";
        emailModal.setAttribute("aria-hidden", "true");
        emailModal.setAttribute("role", "dialog");
        emailModal.setAttribute("aria-modal", "true");
        emailModal.setAttribute("aria-labelledby", "profile-email-modal-title");
        emailModal.innerHTML = `
            <div class="profile-email-modal-card">
                <button type="button" class="profile-email-modal-close" aria-label="Close email change">&times;</button>
                <h3 id="profile-email-modal-title">Change Email</h3>
                <p class="profile-email-current">Current email: <strong></strong></p>

                <form class="profile-email-step-request">
                    <label for="profile-new-email">New email</label>
                    <input type="email" id="profile-new-email" autocomplete="email" required>
                    <label for="profile-confirm-email">Confirm new email</label>
                    <input type="email" id="profile-confirm-email" autocomplete="email" required>
                    <button type="submit" class="profile-email-primary-btn">Send One-Time Passcode</button>
                </form>

                <form class="profile-email-step-verify" hidden>
                    <p>A six-digit code was sent to <strong class="profile-email-destination"></strong>.</p>
                    <label for="profile-email-otp">Verification code</label>
                    <input type="text" id="profile-email-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required>
                    <div class="profile-email-modal-actions">
                        <button type="button" class="profile-email-secondary-btn">Back</button>
                        <button type="submit" class="profile-email-primary-btn">Verify and Update</button>
                    </div>
                </form>

                <p class="profile-email-modal-message" role="status" aria-live="polite"></p>
            </div>`;
        document.body.appendChild(emailModal);

        emailModal.querySelector(".profile-email-modal-close").addEventListener("click", closeEmailModal);
        emailModal.addEventListener("click", (event) => {
            if (event.target === emailModal) closeEmailModal();
        });
        emailModal.querySelector(".profile-email-secondary-btn").addEventListener("click", showEmailRequestStep);

        emailModal.querySelector(".profile-email-step-request").addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = event.currentTarget.querySelector('[type="submit"]');
            const newEmail = emailModal.querySelector("#profile-new-email").value.trim();
            const confirmEmail = emailModal.querySelector("#profile-confirm-email").value.trim();
            setEmailModalMessage();
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";

            const formData = new FormData();
            formData.append("action", "request_email_otp");
            formData.append("email", newEmail);
            formData.append("confirm_email", confirmEmail);
            try {
                const response = await fetch(securityEndpoint, { method: "POST", body: formData, credentials: "same-origin" });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || "Unable to send the verification code.");
                emailModal.querySelector(".profile-email-destination").textContent = data.email;
                emailModal.querySelector(".profile-email-step-request").setAttribute("hidden", "");
                emailModal.querySelector(".profile-email-step-verify").removeAttribute("hidden");
                emailModal.querySelector("#profile-email-otp").focus();
                setEmailModalMessage(data.message);
            } catch (error) {
                setEmailModalMessage(error.message, true);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Send One-Time Passcode";
            }
        });

        emailModal.querySelector(".profile-email-step-verify").addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = event.currentTarget.querySelector('[type="submit"]');
            const formData = new FormData();
            formData.append("action", "verify_email_otp");
            formData.append("otp", emailModal.querySelector("#profile-email-otp").value.trim());
            setEmailModalMessage();
            submitButton.disabled = true;
            submitButton.textContent = "Verifying...";
            try {
                const response = await fetch(securityEndpoint, { method: "POST", body: formData, credentials: "same-origin" });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || "Unable to verify the code.");
                if (fields.email) fields.email.value = data.email;
                closeEmailModal();
                showSuccessModal("Email updated successfully");
            } catch (error) {
                setEmailModalMessage(error.message, true);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Verify and Update";
            }
        });

        return emailModal;
    };

    const openEmailModal = () => {
        const modal = ensureEmailModal();
        modal.querySelector(".profile-email-current strong").textContent = fields.email?.value || "Unavailable";
        modal.querySelector(".profile-email-step-request").reset();
        modal.querySelector(".profile-email-step-verify").reset();
        showEmailRequestStep();
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        modal.querySelector("#profile-new-email").focus();
    };

    let passwordModal = null;
    const setPasswordModalMessage = (message = "", isError = false) => {
        const messageElement = passwordModal?.querySelector(".profile-password-modal-message");
        if (!messageElement) return;
        messageElement.textContent = message;
        messageElement.classList.toggle("error", isError);
    };

    const closePasswordModal = () => {
        if (!passwordModal) return;
        passwordModal.classList.remove("show");
        passwordModal.setAttribute("aria-hidden", "true");
    };

    const ensurePasswordModal = () => {
        if (passwordModal) return passwordModal;

        passwordModal = document.createElement("div");
        passwordModal.id = "profile-password-modal";
        passwordModal.className = "profile-email-modal profile-password-modal";
        passwordModal.setAttribute("aria-hidden", "true");
        passwordModal.setAttribute("role", "dialog");
        passwordModal.setAttribute("aria-modal", "true");
        passwordModal.setAttribute("aria-labelledby", "profile-password-modal-title");
        passwordModal.innerHTML = `
            <div class="profile-email-modal-card">
                <button type="button" class="profile-email-modal-close" aria-label="Close password change">&times;</button>
                <h3 id="profile-password-modal-title">Change Password</h3>
                <form class="profile-password-change-form">
                    <label for="profile-current-password">Current password</label>
                    <input type="password" id="profile-current-password" autocomplete="current-password" required>
                    <label for="profile-new-password">New password</label>
                    <input type="password" id="profile-new-password" autocomplete="new-password" minlength="8" required>
                    <label for="profile-confirm-password">Confirm new password</label>
                    <input type="password" id="profile-confirm-password" autocomplete="new-password" minlength="8" required>
                    <button type="submit" class="profile-email-primary-btn">Update Password</button>
                </form>
                <p class="profile-email-modal-message profile-password-modal-message" role="status" aria-live="polite"></p>
            </div>`;
        document.body.appendChild(passwordModal);

        passwordModal.querySelector(".profile-email-modal-close").addEventListener("click", closePasswordModal);
        passwordModal.addEventListener("click", (event) => {
            if (event.target === passwordModal) closePasswordModal();
        });
        passwordModal.querySelector(".profile-password-change-form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = event.currentTarget.querySelector('[type="submit"]');
            const formData = new FormData();
            formData.append("action", "change_password");
            formData.append("current_password", passwordModal.querySelector("#profile-current-password").value);
            formData.append("new_password", passwordModal.querySelector("#profile-new-password").value);
            formData.append("confirm_password", passwordModal.querySelector("#profile-confirm-password").value);
            setPasswordModalMessage();
            submitButton.disabled = true;
            submitButton.textContent = "Updating...";
            try {
                const response = await fetch(securityEndpoint, { method: "POST", body: formData, credentials: "same-origin" });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || "Unable to update the password.");
                closePasswordModal();
                showSuccessModal("Password updated successfully");
            } catch (error) {
                setPasswordModalMessage(error.message, true);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Update Password";
            }
        });

        return passwordModal;
    };

    const openPasswordModal = () => {
        const modal = ensurePasswordModal();
        modal.querySelector(".profile-password-change-form").reset();
        setPasswordModalMessage();
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        modal.querySelector("#profile-current-password").focus();
    };

    const populateProfile = (profile) => {
        if (profile.theme_preference) {
            localStorage.setItem("katrip-theme", profile.theme_preference);
            applyProfileTheme(profile.theme_preference);
        }
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
        if (fields.gender) {
            const normalizedGender = (profile.gender || "").replaceAll("-", "_");
            fields.gender.value = ["male", "female", "other", "rather_not_say"].includes(normalizedGender)
                ? normalizedGender
                : "";
        }
        if (fields.createdAt) {
            const created = new Date(profile.created_at);
            fields.createdAt.textContent = Number.isNaN(created.getTime()) ? "Created date unavailable" : `Created at ${created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`;
        }
        if (isDriverProfile) {
            if (fields.showFullName) fields.showFullName.checked = Boolean(Number(profile.show_full_name));
            if (fields.vehicleModel) fields.vehicleModel.value = profile.vehicle_model || "";
            if (fields.plateNumber) fields.plateNumber.value = profile.plate_number || "";
            if (fields.vehicleColor) fields.vehicleColor.value = profile.vehicle_color || "";
        }
    };

    const loadProfile = async () => {
        try {
            const response = await fetch(endpoint, { credentials: "same-origin" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to load profile.");
            populateProfile(data.profile);
        } catch (error) {
            if (fields.name) fields.name.textContent = "Unable to load profile";
            showMessage(error.message, true);
        }
    };

    saveButton?.addEventListener("click", async () => {
        const formData = new FormData();
        formData.append("action", "save_personal");
        formData.append("phone", fields.phone?.value.trim() || "");
        formData.append("gender", fields.gender?.value?.replaceAll("-", "_") || "");
        formData.append("theme_preference", document.documentElement.dataset.theme || "light");
        if (isDriverProfile) formData.append("show_full_name", fields.showFullName?.checked ? "1" : "0");

        saveButton.disabled = true;
        try {
            const response = await fetch(endpoint, { method: "POST", body: formData, credentials: "same-origin" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to save profile.");
            populateProfile(data.profile);
            showSuccessModal("Personal information saved successfully");
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            saveButton.disabled = false;
        }
    });

    document.querySelectorAll(".profile-field-edit-btn").forEach((button) => {
        button.addEventListener("click", () => {
            if (button.classList.contains("profile-email-edit-btn")) {
                openEmailModal();
                return;
            }
            if (button.classList.contains("profile-password-edit-btn")) {
                openPasswordModal();
                return;
            }
            button.previousElementSibling?.focus();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && emailModal?.classList.contains("show")) closeEmailModal();
        if (event.key === "Escape" && passwordModal?.classList.contains("show")) closePasswordModal();
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
            localStorage.removeItem("katrip-theme");
            localStorage.removeItem("authToken");
            sessionStorage.clear();
            window.location.href = "../public/loginPage.php";
        }
    });

    loadProfile();
});