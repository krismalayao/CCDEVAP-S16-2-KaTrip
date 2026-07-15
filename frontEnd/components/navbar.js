document.getElementById('navbar-mount').innerHTML = `
<header class="nav">
    <div class="nav-inner">
        <a class="nav-brand" href="driverDashboard.php">
            <img class="nav-logo-img" src="../src/images/katrip_logo.svg" alt="KaTrip logo" />
            <span class="nav-logo-text">KaTrip</span>
        </a>
        <nav class="nav-links">
            <a class="nav-link" href="driverDashboard.php">View Bookings</a>
            <a class="nav-link" href="browseRides.php">Browse Rides</a>
            <a class="nav-link" href="driverCreateTrip.php">Create Trip</a>
        </nav>
        <div class="nav-actions">
            <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open menu" aria-expanded="false">
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
            </button>
            <a class="nav-profile-btn" href="driverProfile.php" aria-label="Profile">
                <span class="nav-profile-initials"></span>
            </a>
        </div>
    </div>

    <div class="nav-dropdown" id="nav-dropdown" aria-hidden="true">
        <a class="nav-dropdown-link" href="driverDashboard.php">View Bookings</a>
        <a class="nav-dropdown-link" href="browseRides.php">Browse Rides</a>
        <a class="nav-dropdown-link" href="driverCreateTrip.php">Create Trip</a>
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
        const initials = `${data.profile.first_name?.[0] || ''}${data.profile.last_name?.[0] || ''}`.toUpperCase() || 'K';
        document.querySelectorAll('.nav-profile-initials').forEach(element => {
            element.textContent = initials;
        });
    })
    .catch(() => {});

// Add shadow once page is scrolled
const navEl = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    navEl.classList.toggle('nav-scrolled', window.scrollY > 4);
});