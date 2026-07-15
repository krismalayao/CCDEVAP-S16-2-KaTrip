document.documentElement.dataset.theme = localStorage.getItem('katrip-theme') || 'light';

document.getElementById('navbar-mount').innerHTML = `
<header class="nav">
    <div class="nav-inner">
        <a class="nav-brand" href="passengerDashboard.php">
            <img class="nav-logo-img" src="../src/images/katrip_logo.svg" alt="KaTrip logo" />
            <span class="nav-logo-text">KaTrip</span>
        </a>
        <nav class="nav-links">
            <a class="nav-link" href="passengerDashboard.php">Home</a>
            <a class="nav-link" href="myBookings.php">View Bookings</a>
            <a class="nav-link" href="browseRides.php">Browse Trips</a>
        </nav>
        <div class="nav-actions">
            <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open menu" aria-expanded="false">
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
            </button>
            <a class="nav-profile-btn" href="passengerProfile.php" aria-label="Profile">
                <span class="nav-profile-initials"></span>
            </a>
        </div>
    </div>

    <div class="nav-dropdown" id="nav-dropdown" aria-hidden="true">
        <a class="nav-dropdown-link" href="passengerDashboard.php">Home</a>
        <a class="nav-dropdown-link" href="myBookings.php">View Bookings</a>
        <a class="nav-dropdown-link" href="browseRides.php">Browse Rides</a>
    </div>
</header>
`;

// Hamburger toggle
const menuBtn = document.getElementById('nav-menu-btn');
const dropdown = document.getElementById('nav-dropdown');

menuBtn.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('nav-dropdown-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
});

// Close on outside click
document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('nav-dropdown-open');
        menuBtn.setAttribute('aria-expanded', false);
    }
});

// Auto-highlight active page
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-link, .nav-dropdown-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('nav-link-active');
    }
});

fetch('../../backEnd/controller/profileController.php', { credentials: 'same-origin' })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
        if (!data?.success) return;
        if (data.profile.theme_preference) {
            localStorage.setItem('katrip-theme', data.profile.theme_preference);
            document.documentElement.dataset.theme = data.profile.theme_preference;
        }
        const initials = `${data.profile.first_name?.[0] || ''}${data.profile.last_name?.[0] || ''}`.toUpperCase() || 'K';
        document.querySelectorAll('.nav-profile-initials').forEach(element => {
            element.textContent = initials;
        });
    })
    .catch(() => {});