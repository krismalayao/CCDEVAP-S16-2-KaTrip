// Setting the Functions for Each Feature
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initPhoneFormatter();
    initStaticLogin();
});

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

// Script for testing User Logins
function initStaticLogin() {
    const loginForm = document.querySelector("form");

    if (!loginForm) return;

    const users = [
        {
            email: "passenger@email.com",
            password: "passenger123",
            role: "passenger"
        },
        {
            email: "driver@email.com",
            password: "driver123",
            role: "driver"
        },
        {
            email: "admin@email.com",
            password: "admin123",
            role: "admin"
        }
    ];

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const typedEmail = document.getElementById("email").value.trim().toLowerCase();
        const typedPassword = document.getElementById("password").value.trim();
        const validUser = users.find(
            (user) =>
                user.email.toLowerCase() === typedEmail &&
                user.password === typedPassword
        );

        if (validUser) {
            switch (validUser.role) {
                case "driver":
                    window.location.href = "../driver/driverDashboard.html";
                    break;

                case "passenger":
                    window.location.href =
                        "../passenger/passengerDashboard.html";
                    break;

                case "admin":
                    window.location.href = "../admin/adminDashboard.html";
                    break;

                default:
                    window.location.href = "landing.html";
            }
        }
    });
}