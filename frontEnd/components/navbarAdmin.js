function initNavbar() {
    const mountPoint = document.getElementById('navbar-mount');

    if (!mountPoint) return;

    mountPoint.innerHTML = `
    <header class="nav">
        <div class="nav-inner">
            <a class="nav-brand" href="adminDashboard.php">
                <img class="nav-logo-img" src="../src/images/katrip_logo.svg" alt="KaTrip logo" />
                <span class="nav-logo-text">KaTrip</span>
            </a>
            
            <nav class="nav-links">
                <a class="nav-link" href="adminDashboard.php">Dashboard</a>
                <a class="nav-link" href="userManagement.php">User Management</a>
                <a class="nav-link" href="tripManagement.php">Trip Management</a>
                <a class="nav-link" href="driverVerification.php">Driver Verification</a>
                <button class="nav-link nav-logout-btn" id="nav-logout-desktop">Logout</button>
            </nav>

            <div class="nav-actions">
                <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open menu" aria-expanded="false">
                    <span class="nav-menu-bar"></span>
                    <span class="nav-menu-bar"></span>
                    <span class="nav-menu-bar"></span>
                    <span class="nav-menu-bar"></span>
                </button>
            </div>
        </div>

        <div class="nav-dropdown" id="nav-dropdown" aria-hidden="true">
            <a class="nav-dropdown-link" href="adminDashboard.php">Dashboard</a>
            <a class="nav-dropdown-link" href="userManagement.php">User Management</a>
            <a class="nav-dropdown-link" href="tripManagement.php">Trip Management</a>
            <a class="nav-dropdown-link" href="driverVerification.php">Driver Verification</a>
            <hr class="nav-dropdown-divider" />
            <button class="nav-dropdown-link nav-logout-btn" id="nav-logout-mobile">Logout</button>
        </div>
    </header>
    `;

    const menuBtn = document.getElementById('nav-menu-btn');
    const dropdown = document.getElementById('nav-dropdown');

    if (menuBtn && dropdown) {
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
    }

    const activeNavPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link, .nav-dropdown-link').forEach(link => {
        if (link.getAttribute('href') === activeNavPage) {
            link.classList.add('nav-link-active');
        }
    });

    const handleLogout = () => {
        window.location.href = '../../backEnd/controller/logoutController.php'; 
    };

    const logoutDesktop = document.getElementById('nav-logout-desktop');
    const logoutMobile = document.getElementById('nav-logout-mobile');
    
    if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
    if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
} else {
    initNavbar();
}