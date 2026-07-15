// -----------------------------------------------------------------------------
// START TRIP PAGE
// -----------------------------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const rideId = params.get('ride_id');

let tripData = null;
let map = null;

if (!rideId) {
    alert('No trip selected.');
    window.location.href = '../driver/driverDashboard.php';
}

// ── Load trip details from the backend ──────────────────────────────────────
function loadTripDetails() {
    fetch(`../../backEnd/controller/getTripDetails.php?ride_id=${rideId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                window.location.href = '../driver/driverDashboard.php';
                return;
            }
            tripData = data;
            renderTripDetails();
        })
        .catch(err => console.error('Failed to load trip details:', err));
}

function renderTripDetails() {
    document.getElementById('driver-name').textContent = tripData.driverName;
    document.getElementById('driver-sub').textContent = tripData.vehicleInfo;
    document.getElementById('driver-avatar').textContent = tripData.driverName.charAt(0).toUpperCase();

    document.getElementById('fare-per-pax').textContent = `PHP ${tripData.farePerPax.toFixed(2)}`;
    document.getElementById('fare-total').textContent = `PHP ${tripData.fareTotal.toFixed(2)}`;
    
    const paxBadgeEl = document.getElementById('pax-badge');
    paxBadgeEl.textContent = tripData.paxBadge;
    paxBadgeEl.classList.remove('pax-low', 'pax-mid', 'pax-full');
    const [current, total] = tripData.paxBadge.split('/').map(s => parseInt(s.trim()));
    if (!isNaN(current) && !isNaN(total) && total > 0) {
        const ratio = current / total;
        if (ratio >= 1) paxBadgeEl.classList.add('pax-full');
        else if (ratio >= 0.5) paxBadgeEl.classList.add('pax-mid');
        else paxBadgeEl.classList.add('pax-low');
        }

    renderRoute();
    renderPassengers();
    renderMap();
}

function renderRoute() {
    const el = document.getElementById('route-list');
    el.innerHTML = tripData.route.map((stop, i) => {
        const isLast = i === tripData.route.length - 1;
        const dotClass = stop.type === 'destination' ? 'red' : stop.type === 'pickup' ? 'pickup' : '';
        const labelClass = stop.type === 'origin' || stop.type === 'destination' ? 'bold' : '';
        return `
            <div class="route-item">
                <div class="route-icon-col">
                    <div class="r-dot ${dotClass}"></div>
                    ${!isLast ? '<div class="r-dash"></div>' : ''}
                </div>
                <div class="route-label ${labelClass}" title="${stop.address || ''}">${stop.label}</div>
            </div>`;
    }).join('');
}

function renderPassengers() {
    const el = document.getElementById('pax-list');

    if (tripData.passengers.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#888;padding:12px;">No passengers yet.</p>';
        return;
    }

    el.innerHTML = tripData.passengers.map(p => {
        const isPending = p.status === 'pending';
        const initial = p.name.charAt(0).toUpperCase();

        const actions = isPending
            ? `<button class="btn-ico accept" onclick="acceptPax(${p.bookingId})" aria-label="Accept">
                  <i class='bx bx-check-circle'></i>
              </button>
              <button class="btn-ico remove" onclick="removePax(${p.bookingId}, true)" aria-label="Remove">
                  <i class='bx bx-x-circle'></i>
              </button>`
            : `<button class="btn-ico remove" onclick="removePax(${p.bookingId}, false)" aria-label="Remove">
                  <i class='bx bx-x-circle'></i>
              </button>`;

        return `
            <div class="pax-row ${isPending ? 'pending' : ''}">
                <div class="pax-avatar">${initial}</div>
                <div class="pax-info">
                    <div class="pax-name">${p.name}</div>
                    <div class="pax-fee">PHP ${p.fee.toFixed(2)}</div>
                </div>
                <div class="pax-actions">${actions}</div>
            </div>`;
    }).join('');
}

// ── Passenger actions ────────────────────────────────────────────────────────
function acceptPax(bookingId) {
    updateBooking(bookingId, 'accepted');
}

function removePax(bookingId, isPending) {
    updateBooking(bookingId, isPending ? 'rejected' : 'cancelled');
    // A pending request gets rejected. An already-accepted passenger gets their booking cancelled.
}

function updateBooking(bookingId, status) {
    fetch('../../backEnd/controller/manageBooking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rideId, status })
    })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
                loadTripDetails(); // refresh counts from server
            } else {
                alert(result.error || 'Could not update this passenger.');
            }
        })
        .catch(err => console.error('Booking update failed:', err));
}

// ── Map ──────────────────────────────────────────────────────────────────────
function makeIcon(color) { //Brought
    return L.divIcon({
        className: '',
        html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22s14-12.37 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
                <circle cx="14" cy="14" r="5" fill="white"/>
              </svg>`,
        iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36]
    });
}

function renderMap() {
    // Did not change much, need help with proper implementation.
    if (map) return;
    map = L.map('map', { zoomControl: true }).setView([14.838, 120.274], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // ── Back to Dashboard control ──────────────────────────────────────────────
    const BackControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar back-control');
        container.innerHTML = `
        <a href="driverDashboard.php" title="Back to Dashboard" role="button" aria-label="Back to Dashboard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
        </a>`;
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
    });
    map.addControl(new BackControl());
    }

// ── Modal ────────────────────────────────────────────────────────────────────
//For the "Start Trip" modal.
document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('modal').classList.add('visible');
});
document.getElementById('btn-wait').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('visible');
});
document.getElementById('btn-proceed').addEventListener('click', () => {
    fetch('../../backEnd/controller/startTrip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId })
    })
        .then(res => res.json()) 
        .then(result => {
            document.getElementById('modal').classList.remove('visible');
            if (result.success) {
                window.location.href = `../driver/driverOngoing.php?ride_id=${rideId}`;
            } else {
                alert(result.error || 'Could not start this trip.');
            }
        })
        .catch(err => {
            console.error('Start trip failed:', err);
            alert('Something went wrong starting this trip.');
        });
});

// For the "Cancel" modal.
document.querySelector('.btn-cancel').addEventListener('click', () => {
    document.getElementById('cancel-modal').classList.add('visible');
});

document.getElementById('btn-keep-trip').addEventListener('click', () => {
    document.getElementById('cancel-modal').classList.remove('visible');
});

document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
    fetch('../../backEnd/controller/cancelTrip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId })
    })
        .then(res => res.json())
        .then(result => {
            document.getElementById('cancel-modal').classList.remove('visible');
            if (result.success) {
                window.location.href = '../driver/driverDashboard.php';
            } else {
                alert(result.error || 'Could not cancel this trip.');
            }
        })
        .catch(err => {
            console.error('Cancel request failed:', err);
            alert('Something went wrong cancelling this trip.');
            document.getElementById('cancel-modal').classList.remove('visible');
        });
});

// ── Mobile bottom-sheet toggle ───────────────────────────────────────────────
function toggleSheet() {
    const panel = document.getElementById('panel');
    panel.classList.toggle('collapsed');
    document.querySelector('.expand-hint').textContent =
        panel.classList.contains('collapsed') ? 'Show details' : 'Hide details';
}

if (window.innerWidth <= 640) {
    document.getElementById('panel').classList.add('collapsed');
    document.querySelector('.expand-hint').textContent = 'Show details';
}

// ── Init ───────────────────────────────────────────────────────────────────
loadTripDetails();
