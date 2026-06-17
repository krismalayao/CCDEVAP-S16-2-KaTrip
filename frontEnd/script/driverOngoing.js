  // ── Trip data ──────────────────────────────────────────────────────────────
  const stops = [
    { id: 0, lat: 14.8302, lon: 120.2842, color: '#9854cb', label: 'Olongapo City Hall',           state: 'done' },
    { id: 1, lat: 14.8270, lon: 120.2800, color: '#deacf5', label: 'SM City Olongapo',             state: 'current' },
    { id: 2, lat: 14.8420, lon: 120.2720, color: '#deacf5', label: 'Subic Bay Freeport Zone Gate', state: 'next' },
    { id: 3, lat: 14.8550, lon: 120.2650, color: '#ff3434', label: 'Subic Bay Boardwalk',          state: 'upcoming' },
  ];

  const passengers = [
    { initials: 'R', name: 'Robin',  dropStop: 3, onBoard: true },
    { initials: 'R', name: 'Ronald', dropStop: 2, onBoard: true },
    { initials: 'P', name: 'Pia',    dropStop: 3, onBoard: true },
  ];

  let currentStopIdx = 1;

  // ── Map ────────────────────────────────────────────────────────────────────
  function makeIcon(color, big) {
    const w = big ? 32 : 28, h = big ? 41 : 36;
    return L.divIcon({
      className: '',
      html: `<svg width="${w}" height="${h}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22s14-12.37 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
               <circle cx="14" cy="14" r="5" fill="white"/>
             </svg>`,
      iconSize: [w, h], iconAnchor: [w/2, h], popupAnchor: [0, -h]
    });
  }

  const map = L.map('map', { zoomControl: true }).setView([14.838, 120.274], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const markerRefs = [];
  stops.forEach((s, i) => {
    const color = s.state === 'done' ? '#9854cb' : s.state === 'current' ? '#9854cb' : s.state === 'next' ? '#deacf5' : '#ff3434';
    const m = L.marker([s.lat, s.lon], { icon: makeIcon(color, s.state === 'current') })
      .addTo(map).bindPopup(s.label);
    markerRefs.push(m);
  });

  const latlngs = stops.map(s => [s.lat, s.lon]);
  L.polyline(latlngs, { color: '#9854cb', weight: 4, opacity: 0.7, dashArray: '8 6' }).addTo(map);
  map.fitBounds(latlngs, { padding: [60, 60] });

  // ── Render route list ──────────────────────────────────────────────────────
  function renderRoute() {
    const el = document.getElementById('route-list');
    el.innerHTML = stops.map((s, i) => {
      const isLast = i === stops.length - 1;
      const isDone = s.state === 'done';
      const isCurrent = s.state === 'current';
      const isNext = s.state === 'next';
      const dotClass = isDone ? 'done' : isCurrent ? '' : s.id === 3 ? 'red' : 'pickup';
      const labelClass = isDone ? 'muted' : 'bold';
      const badge = isDone ? '<span class="stop-badge done">Done</span>'
                  : isCurrent ? '<span class="stop-badge current">You are here</span>'
                  : isNext ? '<span class="stop-badge next">Next</span>' : '';
      return `
        <div class="route-item">
          <div class="route-icon-col">
            <div class="r-dot ${dotClass}"></div>
            ${!isLast ? `<div class="r-dash ${isDone ? 'done' : ''}"></div>` : ''}
          </div>
          <div class="route-label-wrap">
            <div class="route-label ${labelClass}">${s.label}${badge}</div>
          </div>
        </div>`;
    }).join('');
  }

  // ── Render passengers ──────────────────────────────────────────────────────
  function renderPassengers() {
    const onBoard = passengers.filter(p => p.onBoard);
    document.getElementById('pax-count').textContent = `(${onBoard.length} on board)`;
    document.getElementById('pax-grid').innerHTML = passengers.map(p => `
      <div class="pax-chip ${!p.onBoard ? 'dropped' : ''}">
        <div class="chip-avatar">${p.initials}</div>
        <div>
          <div class="chip-name">${p.name}</div>
          <div class="chip-stop">${p.onBoard ? 'Drop: ' + stops[p.dropStop].label.split(' ')[0] : 'Dropped off'}</div>
        </div>
      </div>`).join('');
  }

  // ── Update next stop display ───────────────────────────────────────────────
  function updateNextStop() {
    const next = stops.find(s => s.state === 'next' || s.state === 'current');
    const card = document.getElementById('next-stop-card');
    if (!next || next.state === 'upcoming') {
      card.style.display = 'none'; return;
    }
    const isFinal = next.id === stops.length - 1;
    document.getElementById('next-stop-name').textContent = next.label;
    document.getElementById('next-stop-eta').textContent = isFinal ? 'Final destination' : '~8 min away';
  }

  // ── Mark arrived ───────────────────────────────────────────────────────────
  function markArrived() {
    const curr = stops[currentStopIdx];
    if (!curr) return;

    curr.state = 'done';
    showToast(`Arrived at ${curr.label}`);

    // Drop off any passengers whose stop this is
    passengers.forEach(p => { if (p.dropStop === curr.id) p.onBoard = false; });

    currentStopIdx++;
    if (currentStopIdx < stops.length) {
      stops[currentStopIdx].state = currentStopIdx === stops.length - 1 ? 'current' : 'current';
      if (currentStopIdx + 1 < stops.length) stops[currentStopIdx + 1].state = 'next';
    }

    if (currentStopIdx >= stops.length) {
      document.getElementById('next-stop-card').style.display = 'none';
      showToast('All stops completed! You may end the trip.');
    }

    renderRoute();
    renderPassengers();
    updateNextStop();
    document.getElementById('modal-stops').textContent = `${currentStopIdx} / ${stops.length}`;
  }

  // ── End modal ──────────────────────────────────────────────────────────────
  function openEndModal()  { document.getElementById('end-modal').classList.add('visible'); }
  function closeEndModal() { document.getElementById('end-modal').classList.remove('visible'); }
  function confirmEnd() {
    closeEndModal();
    showToast('Trip ended! Redirecting…');
    setTimeout(() => { window.location.href = 'my-trips.html'; }, 1800);
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ── Mobile sheet ───────────────────────────────────────────────────────────
  function toggleSheet() {
    const panel = document.getElementById('panel');
    const hint  = document.querySelector('.expand-hint');
    panel.classList.toggle('collapsed');
    hint.textContent = panel.classList.contains('collapsed') ? 'Show details' : 'Hide details';
  }

  if (window.innerWidth <= 640) {
    document.getElementById('panel').classList.add('collapsed');
    document.querySelector('.expand-hint').textContent = 'Show details';
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  renderRoute();
  renderPassengers();
  updateNextStop();