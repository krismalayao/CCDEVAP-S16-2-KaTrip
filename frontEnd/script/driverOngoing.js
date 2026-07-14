const rideId = new URLSearchParams(window.location.search).get('ride_id');
let tripData = null;
let currentStopIdx = 0;
let map;

if (!rideId) {
  alert('No ongoing trip selected.');
  window.location.href = '../driver/driverDashboard.html';
}

function makeIcon(color, big = false) {
  const w = big ? 32 : 28;
  const h = big ? 41 : 36;
  return L.divIcon({
    className: '',
    html: `<svg width="${w}" height="${h}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22s14-12.37 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`,
    iconSize: [w, h], iconAnchor: [w / 2, h], popupAnchor: [0, -h]
  });
}

function money(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

async function loadTrip() {
  try {
    const response = await fetch(`../../backEnd/controller/getTripDetails.php?ride_id=${encodeURIComponent(rideId)}`);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Could not load this trip.');
    tripData = data;
    tripData.route.forEach((stop, index) => { stop.state = index === 0 ? 'current' : 'upcoming'; });
    renderTrip();
    await renderMap();
  } catch (error) {
    console.error(error);
    alert(error.message);
    window.location.href = '../driver/driverDashboard.html';
  }
}

function renderTrip() {
  const route = tripData.route;
  const accepted = tripData.passengers.filter(passenger => passenger.status === 'accepted');
  document.getElementById('trip-route-summary').innerHTML =
    `${route[0].label} <i class='bx bx-right-arrow-alt'></i> ${route[route.length - 1].label}`;
  document.getElementById('driver-name').textContent = tripData.driverName;
  document.getElementById('driver-sub').textContent = tripData.vehicleInfo;
  document.getElementById('driver-avatar').textContent = tripData.driverName.charAt(0).toUpperCase();
  document.getElementById('fare-per-pax').textContent = money(tripData.farePerPax);
  document.getElementById('collected').textContent = money(accepted.reduce((total, p) => total + Number(p.fee), 0));
  document.getElementById('pax-count').textContent = `(${accepted.length} on board)`;
  document.getElementById('pax-grid').innerHTML = accepted.length ? accepted.map(p => `
    <div class="pax-chip"><div class="chip-avatar">${p.name.charAt(0).toUpperCase()}</div>
      <div><div class="chip-name">${p.name}</div><div class="chip-stop">${p.seats} seat${p.seats === 1 ? '' : 's'}</div></div>
    </div>`).join('') : '<span class="empty-state">No passengers on board.</span>';
  renderRoute();
  updateNextStop();
}

function renderRoute() {
  document.getElementById('route-list').innerHTML = tripData.route.map((stop, index) => {
    const done = stop.state === 'done';
    const current = stop.state === 'current';
    const dotClass = done ? 'done' : stop.type === 'destination' ? 'red' : stop.type === 'pickup' ? 'pickup' : '';
    const badge = done ? '<span class="stop-badge done">Done</span>' :
      current ? '<span class="stop-badge current">You are here</span>' : '';
    return `<div class="route-item"><div class="route-icon-col"><div class="r-dot ${dotClass}"></div>
      ${index < tripData.route.length - 1 ? `<div class="r-dash ${done ? 'done' : ''}"></div>` : ''}</div>
      <div class="route-label-wrap"><div class="route-label ${done ? 'muted' : 'bold'}" title="${stop.address || ''}">${stop.label}${badge}</div></div></div>`;
  }).join('');
}

async function renderMap() {
  map = L.map('map', { zoomControl: true }).setView([14.5995, 120.9842], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO'
  }).addTo(map);

  const stops = tripData.route.filter(stop => Number.isFinite(stop.lat) && Number.isFinite(stop.lng));
  if (!stops.length) return;
  stops.forEach(stop => {
    const color = stop.type === 'destination' ? '#ff3434' : stop.type === 'pickup' ? '#e2aaf1' : '#9854cb';
    L.marker([stop.lat, stop.lng], { icon: makeIcon(color, stop.state === 'current') }).addTo(map).bindPopup(stop.label);
  });

  const points = stops.map(stop => [stop.lat, stop.lng]);
  map.fitBounds(points, { padding: [40, 40] });
  if (stops.length < 2) return;

  try {
    const waypoints = stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
    const data = await response.json();
    if (!data.routes?.length) throw new Error('No driving route found.');
    const route = data.routes[0];
    L.polyline(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), {
      color: '#000', weight: 3, opacity: 0.7, dashArray: '8 6'
    }).addTo(map);
    const minutes = Math.round(route.duration / 60);
    document.getElementById('travel-time').textContent = minutes >= 60
      ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min` : `${minutes} min`;
  } catch (error) {
    console.warn('Using a direct route fallback:', error);
    L.polyline(points, { color: '#9854cb', weight: 4, opacity: 0.6, dashArray: '8 6' }).addTo(map);
    document.getElementById('travel-time').textContent = 'Unavailable';
  }
}

function updateNextStop() {
  const stop = tripData.route[currentStopIdx];
  const card = document.getElementById('next-stop-card');
  if (!stop) { card.style.display = 'none'; return; }
  card.style.display = 'flex';
  document.getElementById('next-stop-name').textContent = stop.label;
  document.getElementById('next-stop-eta').textContent = stop.type === 'destination' ? 'Final destination' : 'Current stop';
}

function markArrived() {
  const stop = tripData.route[currentStopIdx];
  if (!stop) return;
  stop.state = 'done';
  currentStopIdx += 1;
  if (tripData.route[currentStopIdx]) tripData.route[currentStopIdx].state = 'current';
  renderRoute();
  updateNextStop();
  document.getElementById('modal-stops').textContent = `${currentStopIdx} / ${tripData.route.length}`;
  showToast(`Arrived at ${stop.label}`);
}

function openEndModal() { document.getElementById('end-modal').classList.add('visible'); }
function closeEndModal() { document.getElementById('end-modal').classList.remove('visible'); }
function confirmEnd() {
  closeEndModal();
  showToast('Trip ended! Redirecting...');
  setTimeout(() => { window.location.href = '../driver/driverDashboard.html'; }, 1800);
}
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
function toggleSheet() {
  const panel = document.getElementById('panel');
  panel.classList.toggle('collapsed');
  document.querySelector('.expand-hint').textContent = panel.classList.contains('collapsed') ? 'Show details' : 'Hide details';
}
if (window.innerWidth <= 640) {
  document.getElementById('panel').classList.add('collapsed');
  document.querySelector('.expand-hint').textContent = 'Show details';
}

loadTrip();
