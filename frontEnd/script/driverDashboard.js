// ── Sample trip data ──────────────────────────────────────────────────────────
let trips = [
  {
    id: 1, status: 'ongoing',
    from: 'Makati CBD', to: 'Espana, Manila',
    date: '2026-06-17', time: '7:00 AM',
    passengers: 3, capacity: 4, fare: 92.33,
    pickups: ['Sta. Mesa', 'Quiapo'],
  },
  {
    id: 2, status: 'upcoming',
    from: 'BGC, Taguig', to: 'Quezon Ave, QC',
    date: '2026-06-18', time: '8:30 AM',
    passengers: 2, capacity: 4, fare: 120.00,
    pickups: ['Mandaluyong'],
  },
  {
    id: 3, status: 'upcoming',
    from: 'Alabang, Muntinlupa', to: 'Ortigas, Pasig',
    date: '2026-06-19', time: '6:45 AM',
    passengers: 4, capacity: 4, fare: 210.50,
    pickups: ['Sucat', 'Magallanes'],
  },
  {
    id: 4, status: 'completed',
    from: 'Novaliches, QC', to: 'Intramuros, Manila',
    date: '2026-06-15', time: '7:15 AM',
    passengers: 3, capacity: 4, fare: 155.00,
    pickups: ['Balintawak'],
  },
  {
    id: 5, status: 'completed',
    from: 'Las Pinas', to: 'Binondo, Manila',
    date: '2026-06-12', time: '6:00 AM',
    passengers: 4, capacity: 4, fare: 198.75,
    pickups: ['Paranaque', 'Pasay'],
  },
  {
    id: 6, status: 'cancelled',
    from: 'Antipolo', to: 'Makati CBD',
    date: '2026-06-10', time: '9:00 AM',
    passengers: 1, capacity: 4, fare: 175.00,
    pickups: [],
  },
];

let activeFilter = 'all';
let cancelTargetId = null;

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
      actions.push(`<a href="trip-ongoing.html" class="btn-sm btn-primary">▶ View Live Trip</a>`);
    }
    if (t.status === 'upcoming') {
      actions.push(`<button class="btn-sm btn-primary" onclick="startTrip(${t.id})">▶ Start Trip</button>`);
      actions.push(`<button class="btn-sm btn-outline">Edit</button>`);
      actions.push(`<button class="btn-sm btn-danger" onclick="showCancelModal(${t.id})">✕ Cancel</button>`);
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
  trips = trips.map(t => t.id === id ? { ...t, status: 'ongoing' } : t);
  updateStats();
  renderTrips();
  // In a real app, navigate to trip-ongoing.html
  window.location.href = 'trip-ongoing.html';
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
  if (cancelTargetId) {
    trips = trips.map(t => t.id === cancelTargetId ? { ...t, status: 'cancelled' } : t);
    updateStats();
    renderTrips();
  }
  hideCancelModal();
}

// ── Init ──────────────────────────────────────────────────────────────────────
updateStats();
renderTrips();