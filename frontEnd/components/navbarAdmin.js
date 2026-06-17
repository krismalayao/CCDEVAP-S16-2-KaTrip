document.getElementById('navbar-mount').innerHTML = `
<header class="nav">
    <div class="nav-inner">
        <a class="nav-brand" href="adminDashboard.html">
            <img class="nav-logo-img" src="../src/images/katrip_logo.svg" alt="KaTrip logo" />
            <span class="nav-logo-text">KaTrip</span>
        </a>
        
        <nav class="nav-links">
            <a class="nav-link" href="adminDashboard.html">Dashboard</a>
            <a class="nav-link" href="userManagement.html">User Management</a>
            <a class="nav-link" href="driverVerification.html">Driver Verification</a>
            <button class="nav-link nav-logout-btn" id="nav-logout-desktop">Logout</button>
        </nav>

        <div class="nav-actions">
            <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open menu" aria-expanded="false">
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
                <span class="nav-menu-bar"></span>
            </button>
        </div>
    </div>

    <div class="nav-dropdown" id="nav-dropdown" aria-hidden="true">
        <a class="nav-dropdown-link" href="adminDashboard.html">Dashboard</a>
        <a class="nav-dropdown-link" href="userManagement.html">User Management</a>
        <a class="nav-dropdown-link" href="driverVerification.html">Driver Verification</a>
        <hr class="nav-dropdown-divider" />
        <button class="nav-dropdown-link nav-logout-btn" id="nav-logout-mobile">Logout</button>
    </div>
</header>
`;

const menuBtn = document.getElementById('nav-menu-btn');
const dropdown = document.getElementById('nav-dropdown');

menuBtn.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('nav-dropdown-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    dropdown.setAttribute('aria-hidden', !isOpen);
});

document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('nav-dropdown-open');
        menuBtn.setAttribute('aria-expanded', false);
        dropdown.setAttribute('aria-hidden', true);
    }
});

const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-link, .nav-dropdown-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('nav-link-active');
    }
});

const handleLogout = () => {
    window.location.href = '../public/loginPage.html'; 
};

document.getElementById('nav-logout-desktop').addEventListener('click', handleLogout);
document.getElementById('nav-logout-mobile').addEventListener('click', handleLogout);