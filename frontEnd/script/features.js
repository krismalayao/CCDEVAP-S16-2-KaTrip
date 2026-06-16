// Setting the Functions for Each Feature
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initPhoneFormatter();
    initStaticLogin();
    initRideDetails();
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

// Script for displaying the ride details for each trip
function initRideDetails() {
    const ridesDatabase = {
        '1': {
            route: 'MANILA → ESPANA',
            destination: 'Espana, Manila',
            time: '7:00 am', date: '26 MAY 2026',
            capacityText: '3 / 4 Seats',
            capacityClass: 'badge-green',
            fare: '₱92.33',
            driver: 'Jose Garcia',
            vehicle: 'Honda City • ABC 1234',
            isFull: false 
        },
        '2': { route: 'MANILA → QUIAPO',
            destination: 'Quiapo, Manila',
            time: '6:30 am', date: '26 MAY 2026',
            capacityText: '2 / 4 Seats',
            capacityClass: 'badge-orange',
            fare: '₱55.00', driver: 'John Paul Santos',
            vehicle: 'Toyota Vios • XYZ 5678',
            isFull: false },
        '3': { route: 'MANILA → DIVISORIA',
            destination: 'Divisoria, Manila',
            time: '8:15 am', date: '26 MAY 2026',
            capacityText: '4 / 4 Full',
            capacityClass: 'badge-red',
            fare: '₱40.50', driver: 'Jay Laput',
            vehicle: 'Mitsubishi Mirage • QWE 4567',
            isFull: true
        }
    };

    const rideId = new URLSearchParams(window.location.search).get('id') || '1';
    const ride = ridesDatabase[rideId];
    
    const routeEl = document.getElementById('detail-route');
    if (!routeEl) return; 
    if (!ride) { routeEl.textContent = "Ride Not Found"; return; }

    const textFields = ['route', 'destination', 'time', 'date', 'fare', 'driver', 'vehicle'];
    textFields.forEach(field => {
        const el = document.getElementById(`detail-${field}`);
        if (el) el.textContent = ride[field];
    });

    const capacityEl = document.getElementById('detail-capacity');
    if (capacityEl) {
        capacityEl.textContent = ride.capacityText;
        capacityEl.className = `browserides-capacity-badge ${ride.capacityClass}`;
    }

    if (ride.isFull) {
        const statusEl = document.getElementById('detail-status');
        const reserveBtn = document.getElementById('reserve-btn');
        
        if (statusEl) {
            statusEl.textContent = "Full";
            statusEl.className = "status-badge completed";
        }
        if (reserveBtn) {
            reserveBtn.textContent = "Fully Booked";
            reserveBtn.disabled = true;
            reserveBtn.className = "contact-driver-btn reserve-action-btn badge-disabled";
        }
    }
}