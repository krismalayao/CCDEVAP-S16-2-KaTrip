document.getElementById('navbar-mount').innerHTML = `
<header class="nav">
    <div class="nav-inner">
        <a class="nav-brand" href="passengerDashboard.html">
            <img class="nav-logo-img" src="../src/images/katrip_logo.svg" alt="KaTrip logo" />
            <span class="nav-logo-text">KaTrip</span>
        </a>
        <nav class="nav-links">
            <a class="nav-link" href="passengerDashboard.html">Home</a>
            <a class="nav-link" href="myBookings.html">View Bookings</a>
            <a class="nav-link" href="browseRides.html">Browse Rides</a>
        </nav>
        <div class="nav-actions">
            <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open menu" aria-expanded="false">
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
            </button>
            <a class="nav-profile-btn" href="passengerProfile.html" aria-label="Profile">
                <span class="nav-profile-initials">JD</span>
            </a>
        </div>
    </div>

    <div class="nav-dropdown" id="nav-dropdown" aria-hidden="true">
        <a class="nav-dropdown-link" href="passengerDashboard.html">Home</a>
        <a class="nav-dropdown-link" href="myBookings.html">View Bookings</a>
        <a class="nav-dropdown-link" href="browseRides.html">Browse Rides</a>
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
