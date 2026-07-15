document.documentElement.dataset.theme = localStorage.getItem('katrip-theme') || 'light';

document.getElementById('navbar-mount').innerHTML = `
<header class="nav">
    <div class="nav-inner">
        <a class="nav-brand" href="driverDashboard.php">
            <img class="nav-logo-img" src="../src/images/katrip_logo.svg" alt="KaTrip logo" />
            <span class="nav-logo-text">KaTrip</span>
        </a>
        <nav class="nav-links">
            <a class="nav-link" href="driverDashboard.php">View Bookings</a>
            <a class="nav-link" href="driverRequests.php">
                Requests
                <span class="nav-badge" id="nav-badge" style="display:none;">0</span>
            </a>
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
        <a class="nav-dropdown-link" href="driverRequests.php">
            Requests <span class="nav-badge" id="nav-badge-mobile" style="display:none;">0</span>
        </a>
        <a class="nav-dropdown-link" href="driverCreateTrip.php">Create Ride</a>
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

// Add shadow once page is scrolled
const navEl = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    navEl.classList.toggle('nav-scrolled', window.scrollY > 4);
});

// ── Pending requests badge ────────────────────────────────────────────────
function refreshRequestBadge() {
    fetch('../../backEnd/controller/getPendingRequests.php')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') return;
            const count = data.requests.length;
            document.querySelectorAll('#nav-badge, #nav-badge-mobile').forEach(el => {
                if (count > 0) {
                    el.textContent = count > 9 ? '9+' : count;
                    el.style.display = 'inline-flex';
                } else {
                    el.style.display = 'none';
                }
            });
        })
        .catch(() => {});
}
window.refreshRequestBadge = refreshRequestBadge; // exposed so driverRequests.js can trigger an instant refresh after accept/reject

refreshRequestBadge();
setInterval(refreshRequestBadge, 30000); // poll every 30s so it updates even if the driver just leaves the tab open