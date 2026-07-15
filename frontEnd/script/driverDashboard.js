// ── State ─────────────────────────────────────────────────────────────────────
let trips          = [];
let activeFilter   = 'all';
let cancelTargetId = null;

// ── Fetch trips from backend ──────────────────────────────────────────────────
async function loadTrips() {
    try {
        const resp = await fetch('../../backEnd/model/getTrips.php');
        const data = await resp.json();
        if (data.status === 'success') {
            trips = data.rides.map(r => {
              if (!r.departure_date) {
                  console.warn('Trip missing departure_date:', r.ride_id);
              }
              return {
                  id:         r.ride_id,
                  status:     normalizeStatus(r.ride_status),
                  from:       r.origin,
                  fromName:   r.origin_name || r.origin.split(',')[0],
                  to:         r.destination,
                  toName:     r.destination_name || r.destination.split(',')[0],
                  date:       r.departure_date,
                  time:       r.departure,
                  passengers: parseInt(r.total_seats) - parseInt(r.available_seats),
                  capacity:   parseInt(r.total_seats),
                  fare:       parseFloat(r.cost),
                  pickups:    (r.landmarks || []).map(l => l.landmark_name)
              };
          });
        } else {
            showToast(data.message || 'Failed to load trips.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Could not connect to server.', 'error');
    }
    updateStats();
    renderTrips();
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats() {
  const completed = trips.filter(t => t.status === 'completed');
  const earned = completed.reduce((s, t) => s + t.fare, 0);
  document.getElementById('stat-total').textContent = trips.length;
  document.getElementById('stat-completed').textContent = completed.length;
  document.getElementById('stat-earned').textContent = `PHP ${earned.toFixed(0)}`;
}

// ── Map DB status to frontend status ─────────────────────────────────────────
function normalizeStatus(s) {
    return { scheduled: 'upcoming', ongoing: 'ongoing', completed: 'completed', cancelled: 'cancelled' }[s] || 'upcoming';
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
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Cancel trip button disappears if it's less than 30 minutes before departure.
function canCancel(t) {
  if (!t.date || !t.time) return false;

  const [time, meridian] = t.time.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (meridian === 'PM' && h !== 12) h += 12;
  if (meridian === 'AM' && h === 12) h = 0;

  const departure = new Date(t.date);
  if (isNaN(departure)) return false;
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
  list.sort((a, b) => order[a.status] - order[b.status] || (a.date || '').localeCompare(b.date || ''));

  const container = document.getElementById('trip-list');
  if (!list.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🗺️</div><p>No trips found.</p></div>`;
    return;
  }

  container.innerHTML = list.map(t => {
    const actions = [];
    if (t.status === 'ongoing') {
      actions.push(`<a href="../driver/driverOngoing.php?ride_id=${t.id}" class="btn-sm btn-primary">▶ View Live Trip</a>`);
    }
    if (t.status === 'upcoming') {
      actions.push(`<button class="btn-sm btn-primary" onclick="startTrip(${t.id})">▶ Start Trip</button>`);

      if (canCancel(t)) {
          actions.push(`<a href="../driver/driverCreateTrip.php?ride_id=${t.id}" class="btn-sm btn-outline">Edit</a>`);
          actions.push(`<button class="btn-sm btn-danger" onclick="showCancelModal(${t.id})">Cancel</button>`);
      } else {
          actions.push(`<button class="btn-sm btn-outline" disabled title="Trip starts too soon to edit">Edit</button>`);
          actions.push(`<button class="btn-sm btn-danger" disabled title="Trips can only be cancelled at least 30 minutes before departure">Cancel</button>`);
      }
    }
    if (t.status === 'completed') {
      actions.push(`<button class="btn-sm btn-ghost" onclick="showSummaryModal(${t.id})">View Summary</button>`);
      actions.push(`<a href="../driver/driverCreateTrip.php?clone_id=${t.id}" class="btn-sm btn-outline">Repeat Trip</a>`);
    }
    if (t.status === 'cancelled') {
      actions.push(`<a href="../driver/driverCreateTrip.php?clone_id=${t.id}" class="btn-sm btn-outline">Recreate</a>`);
    }

    const pickupText = t.pickups.length ? `${t.pickups.join(', ')}` : '—';

    return `<div class="trip-card trip-card-${t.status}">
      <div class="trip-card-top">
        <div class="trip-route-text">
          <span class="route-part" title="${t.from}">${t.fromName}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span class="route-part" title="${t.to}">${t.toName}</span>
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
  window.location.href = '../driver/driverStartTrip.php?ride_id=' + id;
}

let editTargetId = null;

function showEditModal(id) {
  const t = trips.find(tr => tr.id === id);
  if (!t) return;
  editTargetId = id;

  document.getElementById('edit-date').value = t.date || '';
  document.getElementById('edit-time').value = to24Hour(t.time);
  document.getElementById('edit-capacity').value = t.capacity;
  document.getElementById('edit-fare').value = t.fare;

  document.getElementById('edit-modal').style.display = 'flex';
}

function hideEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  editTargetId = null;
}

function to24Hour(t) {
  if (!t) return '';
  const [time, meridian] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (meridian === 'PM' && h !== 12) h += 12;
  if (meridian === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function confirmEdit() {
  if (!editTargetId) return hideEditModal();

  const payload = {
    rideId:      editTargetId,
    date:        document.getElementById('edit-date').value,
    time:        document.getElementById('edit-time').value,
    totalSeats:  parseInt(document.getElementById('edit-capacity').value),
    fare:        parseFloat(document.getElementById('edit-fare').value)
  };

  fetch('../../backEnd/controller/editTrip.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        loadTrips();
      } else {
        alert(result.error || 'Could not update this trip.');
      }
      hideEditModal();
    })
    .catch(err => {
      console.error('Edit request failed:', err);
      alert('Something went wrong updating this trip.');
      hideEditModal();
    });
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

function showSummaryModal(id) {
  const t = trips.find(tr => tr.id === id);
  if (!t) return;

  document.getElementById('summary-route').innerHTML = `
    ${t.from}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    ${t.to}
  `;
  document.getElementById('summary-date').textContent = `${formatDate(t.date)} · ${t.time}`;

  document.getElementById('summary-pax').innerHTML =
    `<span class="capacity-badge ${capClass(t.passengers, t.capacity)}">${t.passengers} / ${t.capacity}</span>`;

  document.getElementById('summary-fare').textContent = `PHP ${t.fare.toFixed(2)}`;

  document.getElementById('summary-pickups').innerHTML = t.pickups.length
    ? t.pickups.map(p => `
        <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
          <div style="width:6px;height:6px;border-radius:50%;background:#c084fc;flex-shrink:0;"></div>
          ${p}
        </div>`).join('')
    : '<span style="color:#9ca3af;">No pickup stops</span>';

  document.getElementById('summary-modal').style.display = 'flex';
}

function hideSummaryModal() {
  document.getElementById('summary-modal').style.display = 'none';
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadTrips();

// Periodically re-render so the cancel/edit buttons disappear if the trip is too close to departure time
setInterval(renderTrips, 30000);
