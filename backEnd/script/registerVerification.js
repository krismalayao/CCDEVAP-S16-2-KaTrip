// Setting the Functions for Each Feature
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initPhoneFormatter();
    initStaticRegistration();
});

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Toggling See Password Button/Icon
function initPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-button');
    const toggleIcon = document.getElementById('toggle-icon');

    if (!passwordInput || !toggleButton || !toggleIcon) return;

    toggleButton.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'bx bxs-lock-open-alt';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'bx bxs-lock-alt';
        }
    });
}

// Script for Mobile Number Input
function initPhoneFormatter() {
    const phoneInput = document.getElementById('phone_number');

    if (!phoneInput) return;

    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 3 && value.length <= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 6) {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
        
        e.target.value = value;
    });
}

// Script for User Registration
function initStaticRegistration() {
    const regForm = document.getElementById("registration-form");
    const driverCheckbox = document.getElementById("katrip_driver");
    const otpModal = document.getElementById('otp-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const otpForm = document.getElementById('otp-form');

    if (!regForm || !driverCheckbox || !otpModal || !closeModalBtn || !otpForm) return;

    // Submit Registration Form data to register_process.php
    regForm.addEventListener("submit", (event) => {
        event.preventDefault();
        
        showToast("Sending your verification code... Please wait.", "info");
        
        // Disable submit button so no spamming occurs
        const registerBtn = regForm.querySelector(".reg-button");
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.innerText = "Processing...";
        }
        const dataPayload = new FormData(regForm);

        fetch("/CCDEVAP-S16-2-KaTrip/backend/registrationProcess/registerProcess.php", {
            method: "POST",
            body: dataPayload
        })

        .then(response => response.json())
        .then(data => {
            // Re-enable button when response comes back
            if (registerBtn) {
                registerBtn.disabled = false;
                registerBtn.innerText = "Register";
            }

            if (data.status === "otp_sent") {
                showToast(data.message, "success");
                otpModal.classList.add('show');
            } else {
                showToast(data.message, "error");
            }
        })
        .catch(err => {
            if (registerBtn) {
                registerBtn.disabled = false;
                registerBtn.innerText = "Register";
            }
            showToast("Could not communicate with the registration server.", "error");
            console.error("Fetch error details:", err);
        });
    });

    // Dismiss verification modal step reset
    closeModalBtn.addEventListener('click', () => {
        otpModal.classList.remove('show');
    });

    // Submit Verification form code check to verify_otp.php
    otpForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const enteredOTP = document.getElementById('otp-code').value.trim(); // NOTE: This connects to the HTML modal input pertaining to otp-code
        const verificationPayload = new FormData();
        verificationPayload.append('otp_code', enteredOTP); // Appends a new array value which is otp_code, to be used in verify_otp

        fetch("/CCDEVAP-S16-2-KaTrip/backend/registrationProcess/verifyOTP.php", {
            method: "POST",
            body: verificationPayload
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const isDriverRegistration = driverCheckbox.checked;
                otpModal.classList.remove('show');
                showToast(data.message, "success");
                regForm.reset();
                
                setTimeout(() => {
                    if (isDriverRegistration) {
                        window.location.href = '../../frontEnd/driver/driverApplication.html';
                    } else {
                        window.location.href = "../../frontEnd/public/loginPage.php";
                    }
                }, 2000);
            } else {
                showToast(data.message, "error");
            }
        })
        .catch(err => {
            showToast("Could not connect to the verification server.", "error");
            console.error("Verification error details:", err);
        });
    });
}