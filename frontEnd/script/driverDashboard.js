// ── Trip data (loaded from the backend) ────────────────────────────────────
let trips = [];

let activeFilter = 'all';
let cancelTargetId = null;

// ── Load trips from the backend ─────────────────────────────────────────────
function loadTrips() {
fetch('../../backEnd/controller/driverDashController.php')
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error('Failed to load trips:', data.error);
        return;
      }
      trips = data.trips;
      updateStats();
      renderTrips();
    })
    .catch(err => console.error('Failed to load trips:', err));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats() {
  const completed = trips.filter(t => t.status === 'completed');
  const earned = completed.reduce((s, t) => s + t.fare, 0);
  document.getElementById('stat-total').textContent = trips.length;
  document.getElementById('stat-completed').textContent = completed.length;
  document.getElementById('stat-earned').textContent = `PHP ${earned.toFixed(0)}`;
}

// ── Filter ────────────────────────────────────────────────────────────────────
function setFilter(filter, el) {
  activeFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderTrips();
}

function filterTrips() { renderTrips(); }

// ── Render ────────────────────────────────────────────────────────────────────
function capClass(p, c) {
  const ratio = p / c;
  if (ratio >= 1) return 'cap-full';
  if (ratio >= 0.75) return 'cap-almost';
  return 'cap-open';
}

function statusLabel(s) {
  return { ongoing: 'Ongoing', upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' }[s] || s;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Cancel trip button disappears if it's less than 30 minutes before departure.
function canCancel(t) {
  const [time, meridian] = t.time.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (meridian === 'PM' && h !== 12) h += 12;
  if (meridian === 'AM' && h === 12) h = 0;

  const departure = new Date(t.date);
  departure.setHours(h, m, 0, 0);

  return (departure - new Date()) / 60000 >= 30;
}


function renderTrips() {
  const q = document.getElementById('search-input').value.toLowerCase();
  let list = trips.filter(t => {
    const matchFilter = activeFilter === 'all' || t.status === activeFilter;
    const matchSearch = !q || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q) || t.date.includes(q);
    return matchFilter && matchSearch;
  });

  // Sort: ongoing first, then upcoming by date, then completed, then cancelled
  const order = { ongoing: 0, upcoming: 1, completed: 2, cancelled: 3 };
  list.sort((a, b) => order[a.status] - order[b.status] || a.date.localeCompare(b.date));

  const container = document.getElementById('trip-list');
  if (!list.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🗺️</div><p>No trips found.</p></div>`;
    return;
  }

  container.innerHTML = list.map(t => {
    const actions = [];
    if (t.status === 'ongoing') {
      actions.push(`<a href="../driver/driverOngoing.html" class="btn-sm btn-primary">▶ View Live Trip</a>`);
    }
    if (t.status === 'upcoming') {
      actions.push(`<button class="btn-sm btn-primary" onclick="startTrip(${t.id})">▶ Start Trip</button>`);
      actions.push(`<button class="btn-sm btn-outline">Edit</button>`);
      if (canCancel(t)) actions.push(`<button class="btn-sm btn-danger" onclick="showCancelModal(${t.id})">✕ Cancel</button>`);
    }
    if (t.status === 'completed') {
      actions.push(`<button class="btn-sm btn-ghost">View Summary</button>`);
      actions.push(`<button class="btn-sm btn-outline">Repeat Trip</button>`);
    }
    if (t.status === 'cancelled') {
      actions.push(`<button class="btn-sm btn-outline">Recreate</button>`);
    }

    const pickupText = t.pickups.length ? `${t.pickups.join(', ')}` : '—';

    return `<div class="trip-card">
      <div class="trip-card-top">
        <div class="trip-route-text">
          ${t.from}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          ${t.to}
        </div>
        <span class="status-badge status-${t.status}">${statusLabel(t.status)}</span>
      </div>

      <div class="trip-meta">
        <div class="trip-meta-item">
          <span class="trip-meta-label">Date</span>
          <span class="trip-meta-value">${formatDate(t.date)}</span>
        </div>
        <div class="trip-meta-item">
          <span class="trip-meta-label">Time</span>
          <span class="trip-meta-value">${t.time}</span>
        </div>
        <div class="trip-meta-item">
          <span class="trip-meta-label">Capacity</span>
          <span class="trip-meta-value">
            <span class="capacity-badge ${capClass(t.passengers, t.capacity)}">${t.passengers} / ${t.capacity}</span>
          </span>
        </div>
        <div class="trip-meta-item">
          <span class="trip-meta-label">Est. Fare</span>
          <span class="trip-meta-value">PHP ${t.fare.toFixed(2)}</span>
        </div>
        <div class="trip-meta-item">
          <span class="trip-meta-label">Pickups</span>
          <span class="trip-meta-value" style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${pickupText}</span>
        </div>
      </div>

      ${actions.length ? `<div class="trip-card-actions">${actions.join('')}</div>` : ''}
    </div>`;
  }).join('');
}

function startTrip(id) {
  // Note: The  ride_status change to 'ongoing' in driverStartTrip.html
  // once the driver confirms via the "Proceed" modal there, not here.
  window.location.href = '../driver/driverStartTrip.html?ride_id=' + id;
}

function showCancelModal(id) {
  cancelTargetId = id;
  document.getElementById('cancel-modal').style.display = 'flex';
}
function hideCancelModal() {
  document.getElementById('cancel-modal').style.display = 'none';
  cancelTargetId = null;
}
function confirmCancel() {
  if (!cancelTargetId) {
    hideCancelModal();
    return;
  }

  fetch('../../backEnd/controller/cancelTrip.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rideId: cancelTargetId })
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        loadTrips(); // refresh from the server so list reflects the real state
      } else {
        alert(result.error || 'Could not cancel this trip.');
      }
      hideCancelModal();
    })
    .catch(err => {
      console.error('Cancel request failed:', err);
      alert('Something went wrong cancelling this trip.');
      hideCancelModal();
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadTrips();