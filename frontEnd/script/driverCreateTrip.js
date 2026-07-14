// =============================================================================
// DRIVER - CREATE TRIP PAGE
// =============================================================================

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  from:          null, // { name, display, lat, lon }
  to:            null,
  pickups:       [{ id: 1, value: '', loc: null }, { id: 2, value: '', loc: null }],
  routeDistance: null, // km
  routeDuration: null, // seconds
};

let pickupIdCounter = 3;

const urlParams  = new URLSearchParams(window.location.search);
const editRideId = urlParams.get('ride_id');
const cloneId     = urlParams.get('clone_id');

const BASE_FARE   = 50;
const FARE_PER_KM = 15;

// ─── Map Setup ───────────────────────────────────────────────────────────────
const map = L.map('map', { zoomControl: true }).setView([14.5995, 120.9842], 12);

// CartoDB Voyager — clean, muted colors
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap © CARTO'
}).addTo(map);

// ── Back to Dashboard control ──────────────────────────────────────────────
const BackControl = L.Control.extend({
  options: { position: 'topleft' },
  onAdd: function () {
    const container = L.DomUtil.create('div', 'leaflet-bar back-control');
    container.innerHTML = `
      <a href="driverDashboard.html" title="Back to Dashboard" role="button" aria-label="Back to Dashboard">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </a>`;
    L.DomEvent.disableClickPropagation(container);
    return container;
  }
});
map.addControl(new BackControl());

let fromMarker = null, toMarker = null, routeLayer = null;
const pickupMarkers = {};

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22s14-12.37 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
             <circle cx="14" cy="14" r="5" fill="white"/>
           </svg>`,
    iconSize:     [28, 36],
    iconAnchor:   [14, 36],
    popupAnchor:  [0, -36]
  });
}

// ─── Geocoding (Nominatim) ───────────────────────────────────────────────────
const acTimers = {};

async function searchPlaces(q) {
  if (!q || q.length < 3) return [];
  try {
    const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
      q:              q + ', Philippines',
      format:         'json',
      addressdetails: 1,
      limit:          5,
      countrycodes:   'ph'
    });
    const resp = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'KaTrip/1.0' }
    });
    const data = await resp.json();
    return data.map(r => ({
      name:         r.name || r.display_name.split(',')[0],
      display_name: r.display_name,
      lat:          parseFloat(r.lat),
      lon:          parseFloat(r.lon)
    }));
  } catch (e) {
    console.error('searchPlaces error:', e);
    return [];
  }
}

// ─── Origin / Destination Inputs ─────────────────────────────────────────────
function onLocInput(side) {
  clearTimeout(acTimers[side]);
  const val = document.getElementById(`input-${side}`).value;
  if (!val) { hideAc(side); return; }
  acTimers[side] = setTimeout(async () => {
    const results = await searchPlaces(val);
    showAc(side, results);
  }, 350);
}

function showAc(side, results) {
  const el = document.getElementById(`ac-${side}`);
  if (!results.length) { el.style.display = 'none'; return; }
  el.innerHTML = results.map((r, i) => `
    <div class="autocomplete-item" onmousedown="selectLoc('${side}', ${i})" data-idx="${i}">
      <span class="ac-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </span>
      <div>
        <div class="ac-name">${r.name}</div>
        <div class="ac-addr">${r.display_name}</div>
      </div>
    </div>`).join('');
  el._results = results;
  el.style.display = 'block';
}

function selectLoc(side, idx) {
  const el  = document.getElementById(`ac-${side}`);
  const r   = el._results[idx];
  const loc = {
    display: r.display_name,
    lat:     parseFloat(r.lat),
    lon:     parseFloat(r.lon),
    name:    r.name || r.display_name.split(',')[0]
  };
  document.getElementById(`input-${side}`).value = loc.name || loc.display;
  state[side] = loc;
  el.style.display = 'none';
  updateMapMarker(side, loc);
  tryRoute();
}

function hideAc(side)    { document.getElementById(`ac-${side}`).style.display = 'none'; }
function onLocFocus(side) { const v = document.getElementById(`input-${side}`).value; if (v.length >= 3) onLocInput(side); }
function onLocBlur(side)  { setTimeout(() => hideAc(side), 200); }

// ─── Swap Origin / Destination ───────────────────────────────────────────────
function swapLocations() {
  [state.from, state.to] = [state.to, state.from];
  document.getElementById('input-from').value = state.from ? (state.from.name || state.from.display) : '';
  document.getElementById('input-to').value   = state.to   ? (state.to.name   || state.to.display)   : '';
  if (state.from) updateMapMarker('from', state.from);
  if (state.to)   updateMapMarker('to',   state.to);
  tryRoute();
}

// ─── Map Markers ─────────────────────────────────────────────────────────────
function updateMapMarker(side, loc) {
  if (side === 'from') {
    if (fromMarker) map.removeLayer(fromMarker);
    fromMarker = L.marker([loc.lat, loc.lon], { icon: makeIcon('#9854cb') }).addTo(map);
  } else {
    if (toMarker) map.removeLayer(toMarker);
    toMarker = L.marker([loc.lat, loc.lon], { icon: makeIcon('var(--destination)') }).addTo(map);
  }
  fitMapBounds();
}

function fitMapBounds() {
  const pts = [];
  if (state.from) pts.push([state.from.lat, state.from.lon]);
  if (state.to)   pts.push([state.to.lat,   state.to.lon]);
  state.pickups.forEach(p => { if (p.loc) pts.push([p.loc.lat, p.loc.lon]); });
  if (pts.length > 1)     map.fitBounds(pts, { padding: [40, 40] });
  else if (pts.length === 1) map.setView(pts[0], 14);
}

// ─── Route + Fare Estimation (Haversine) ─────────────────────────────────────
async function tryRoute() {
  if (!state.from || !state.to) return;
  document.getElementById('travel-time').innerHTML = 'Calculating<span class="spinner"></span>';

  // Find route using OSRM
if (routeLayer) map.removeLayer(routeLayer);

const osrmUrl = `https://router.project-osrm.org/route/v1/driving/`
  + `${state.from.lon},${state.from.lat};${state.to.lon},${state.to.lat}`
  + `?overview=full&geometries=geojson`;

try {
  const resp = await fetch(osrmUrl);
  const data = await resp.json();
  const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);

  // Use actual distance and duration from OSRM
  state.routeDistance = data.routes[0].distance / 1000; // meters → km
  state.routeDuration = data.routes[0].duration;        // already in seconds

  routeLayer = L.polyline(coords, {
    color: '#000', weight: 3, opacity: 0.7, dashArray: '8 6'
  }).addTo(map);

} catch (e) {
  // Fallback to straight line if OSRM fails
  routeLayer = L.polyline(
    [[state.from.lat, state.from.lon], [state.to.lat, state.to.lon]],
    { color: '#a855f7', weight: 4, opacity: 0.6, dashArray: '8 6' }
  ).addTo(map);

  // Haversine fallback
  const R    = 6371;
  const dLat = (state.to.lat - state.from.lat) * Math.PI / 180;
  const dLon = (state.to.lon - state.from.lon) * Math.PI / 180;
  const a    = Math.sin(dLat/2)**2 + Math.cos(state.from.lat * Math.PI/180)
               * Math.cos(state.to.lat * Math.PI/180) * Math.sin(dLon/2)**2;
  state.routeDistance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.3;
  state.routeDuration = (state.routeDistance / 40) * 3600;
}

fitMapBounds();
updateTravelTime();
updateFare();
}

function updateTravelTime() {
  if (!state.routeDuration) return;
  const mins = Math.round(state.routeDuration / 60);
  const h    = Math.floor(mins / 60);
  const m    = mins % 60;
  document.getElementById('travel-time').textContent = h > 0 ? `${h} hr ${m} min` : `${m} min`;
}

function updateFare() {
  if (!state.routeDistance) {
    document.getElementById('fare-display').textContent = 'PHP —';
    return;
  }
  const pax  = parseInt(document.getElementById('passengers').value) || 1;
  const fare = Math.round((BASE_FARE + state.routeDistance * FARE_PER_KM) * (1 + (pax - 1) * 0.15));
  document.getElementById('fare-display').textContent = `PHP ${fare.toFixed(2)}`;
}

document.getElementById('passengers').addEventListener('input', updateFare);

// ─── Pickup Locations ─────────────────────────────────────────────────────────
function renderPickups() {
  document.getElementById('pickup-list').innerHTML = state.pickups.map(p => `
    <div class="pickup-row" id="pickup-row-${p.id}">
      <div class="purple-dot"></div>
      <div class="pickup-input-wrap">
        <input
          class="pickup-input"
          id="pickup-input-${p.id}"
          value="${p.value}"
          placeholder="Pickup Location"
          autocomplete="off"
          oninput="onPickupInput(${p.id})"
          onfocus="onPickupFocus(${p.id})"
          onblur="onPickupBlur(${p.id})"
        />
        <button class="clear-btn" onmousedown="clearPickup(${p.id})"><i class='bx bx-xn '></i></button>
        <div class="autocomplete-list" id="ac-pickup-${p.id}" style="display:none;"></div>
      </div>
    </div>`).join('');
}

function onPickupInput(id) {
  const val = document.getElementById(`pickup-input-${id}`).value;
  const p   = state.pickups.find(x => x.id === id);
  if (p) p.value = val;
  clearTimeout(acTimers[`pickup-${id}`]);
  if (!val) { document.getElementById(`ac-pickup-${id}`).style.display = 'none'; return; }
  acTimers[`pickup-${id}`] = setTimeout(async () => {
    const results = await searchPlaces(val);
    showPickupAc(id, results);
  }, 350);
}

function showPickupAc(id, results) {
  const el = document.getElementById(`ac-pickup-${id}`);
  if (!results.length) { el.style.display = 'none'; return; }
  el.innerHTML = results.map((r, i) => `
    <div class="autocomplete-item" onmousedown="selectPickupLoc(${id}, ${i})">
      <span class="ac-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </span>
      <div>
        <div class="ac-name">${r.name}</div>
        <div class="ac-addr">${r.display_name}</div>
      </div>
    </div>`).join('');
  el._results = results;
  el.style.display = 'block';
}

function selectPickupLoc(id, idx) {
  const el  = document.getElementById(`ac-pickup-${id}`);
  const r   = el._results[idx];
  const loc = {
    display: r.display_name,
    lat:     parseFloat(r.lat),
    lon:     parseFloat(r.lon),
    name:    r.name || r.display_name.split(',')[0]
  };
  const p = state.pickups.find(x => x.id === id);
  if (p) { p.value = loc.name; p.loc = loc; }
  document.getElementById(`pickup-input-${id}`).value = loc.name;
  el.style.display = 'none';
  if (pickupMarkers[id]) map.removeLayer(pickupMarkers[id]);
  pickupMarkers[id] = L.marker([loc.lat, loc.lon], { icon: makeIcon('var(--pickup)') })
    .addTo(map)
    .bindPopup(`Pickup: ${loc.name}`);
  fitMapBounds();
}

function clearPickup(id) {
  state.pickups = state.pickups.filter(x => x.id !== id);
  if (pickupMarkers[id]) { map.removeLayer(pickupMarkers[id]); delete pickupMarkers[id]; }
  renderPickups();
  fitMapBounds();
}


function onPickupFocus(id) { const v = document.getElementById(`pickup-input-${id}`).value; if (v.length >= 3) onPickupInput(id); }
function onPickupBlur(id)  { setTimeout(() => { const el = document.getElementById(`ac-pickup-${id}`); if (el) el.style.display = 'none'; }, 200); }

function addPickup() {
  state.pickups.push({ id: pickupIdCounter++, value: '', loc: null });
  renderPickups();
}

// ─── Date Helper ─────────────────────────────────────────────────────────────
function getLocalDateString(date = new Date()) {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ─── Create Ride ──────────────────────────────────────────────────────────────
async function createRide() {
    if (!state.from || !state.to) {
        showToast('Please set origin and destination.','error');
        return;
    }

    const fare  = parseFloat(document.getElementById('fare-display').textContent.replace('PHP ', '')) || 0;
    const seats = parseInt(document.getElementById('passengers').value) || 4;
    const date  = document.getElementById('ride-date').value;
    const time  = document.getElementById('ride-time').value;

    const payload = {
        origin:            state.from.display,
        origin_name:       state.from.name,
        origin_lat:        state.from.lat,
        origin_lng:        state.from.lon,
        destination:       state.to.display,
        destination_name:  state.to.name,
        dest_lat:          state.to.lat,
        dest_lng:          state.to.lon,
        departure_date:    date,
        departure_time:    time,
        total_seats:       seats,
        cost:              fare,
        landmarks: state.pickups
            .filter(p => p.loc)
            .map(p => ({ name: p.value, lat: p.loc.lat, lng: p.loc.lon }))
    };

    const endpoint = editRideId
        ? '../../backEnd/controller/editTrip.php'
        : '../../backEnd/model/createTrip.php';

    if (editRideId) payload.rideId = parseInt(editRideId);

    try {
        const resp = await fetch(endpoint, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
        const data = await resp.json();
        const ok = editRideId ? data.success : data.status === 'success';
        if (ok) {
            showToast(editRideId ? 'Trip updated!' : 'Ride created!', 'success');
            setTimeout(() => { window.location.href = 'driverDashboard.html'; }, 1500);
        } else {
            showToast(data.error || data.message || 'Something went wrong.','error');
        }
    } catch (e) {
        console.error(e);
        showToast('Could not connect to server.','error');
    }
}

// ─── Load Existing Trip for Editing ───────────────────────────────────────────
async function loadExistingTrip() {
    try {
        const resp = await fetch(`../../backEnd/controller/getRideForEdit.php?ride_id=${editRideId}`);
        const data = await resp.json();
        if (data.status !== 'success') {
            showToast(data.message || 'Could not load this trip.', 'error');
            setTimeout(() => { window.location.href = 'driverDashboard.html'; }, 1500);
            return;
        }
        const r = data.ride;

        state.from = { name: r.origin_name || r.origin.split(',')[0], display: r.origin, lat: r.origin_lat, lon: r.origin_lng };
        state.to   = { name: r.destination_name || r.destination.split(',')[0], display: r.destination, lat: r.dest_lat, lon: r.dest_lng };
        document.getElementById('input-from').value = state.from.name;
        document.getElementById('input-to').value   = state.to.name;
        updateMapMarker('from', state.from);
        updateMapMarker('to', state.to);

        state.pickups = r.landmarks.map((lm, i) => ({
            id: pickupIdCounter++,
            value: lm.name,
            loc: { name: lm.name, display: lm.name, lat: lm.lat, lon: lm.lng }
        }));
        if (state.pickups.length === 0) {
            state.pickups = [{ id: pickupIdCounter++, value: '', loc: null }];
        }
        renderPickups();
        state.pickups.forEach(p => {
            if (p.loc) {
                pickupMarkers[p.id] = L.marker([p.loc.lat, p.loc.lon], { icon: makeIcon('var(--pickup)') })
                    .addTo(map).bindPopup(`Pickup: ${p.loc.name}`);
            }
        });

        document.getElementById('ride-date').value  = r.departure_date;
        document.getElementById('ride-time').value  = r.departure;
        document.getElementById('passengers').value = r.total_seats;

        document.querySelector('.card-title').textContent = 'Where to?'; // unchanged, page still says "Where to?"
        document.getElementById('create-btn').textContent = 'Save Changes';

        await tryRoute(); // draws path, recalculates fare/travel time
    } catch (e) {
        console.error(e);
        showToast('Could not load this trip.', 'error');
    }
}

// ─── Load Trip for Cloning ─────────────────────────────────────────────────────
async function loadCloneTrip() {
    try {
        const resp = await fetch(`../../backEnd/controller/getRideForClone.php?ride_id=${cloneId}`);
        const data = await resp.json();
        if (data.status !== 'success') {
            showToast(data.message || 'Could not load this trip.', 'error');
            return;
        }
        const r = data.ride;

        state.from = { name: r.origin_name || r.origin.split(',')[0], display: r.origin, lat: r.origin_lat, lon: r.origin_lng };
        state.to   = { name: r.destination_name || r.destination.split(',')[0], display: r.destination, lat: r.dest_lat, lon: r.dest_lng };
        document.getElementById('input-from').value = state.from.name;
        document.getElementById('input-to').value   = state.to.name;
        updateMapMarker('from', state.from);
        updateMapMarker('to', state.to);

        state.pickups = r.landmarks.map(lm => ({
            id: pickupIdCounter++,
            value: lm.name,
            loc: { name: lm.name, display: lm.name, lat: lm.lat, lon: lm.lng }
        }));
        if (state.pickups.length === 0) {
            state.pickups = [{ id: pickupIdCounter++, value: '', loc: null }];
        }
        renderPickups();
        state.pickups.forEach(p => {
            if (p.loc) {
                pickupMarkers[p.id] = L.marker([p.loc.lat, p.loc.lon], { icon: makeIcon('var(--pickup)') })
                    .addTo(map).bindPopup(`Pickup: ${p.loc.name}`);
            }
        });

        document.getElementById('passengers').value = r.total_seats;
        // Date intentionally left as today's default — driver picks a fresh date/time.

        showToast('Pick a new date and time.', 'default');
        await tryRoute();
    } catch (e) {
        console.error(e);
        showToast('Could not load this trip.', 'error');
    }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = ''; // reset classes
  t.classList.add('show', `toast-${type}`);
  setTimeout(() => t.classList.remove('show', `toast-${type}`), 3000);
}

// ─── Mobile Bottom-Sheet Toggle ───────────────────────────────────────────────
function toggleSheet() {
  const panel = document.querySelector('.panel');
  const hint  = document.querySelector('.expand-hint');
  panel.classList.toggle('collapsed');
  hint.textContent = panel.classList.contains('collapsed') ? 'Show details' : 'Hide details';
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.getElementById('ride-date').min = getLocalDateString();

if (editRideId) {
  loadExistingTrip();
} else if (cloneId) {
  document.getElementById('ride-date').value = getLocalDateString();
  renderPickups();
  loadCloneTrip();
} else {
  document.getElementById('ride-date').value = getLocalDateString();
  renderPickups();
}

if (window.innerWidth <= 640) {
  document.querySelector('.panel').classList.add('collapsed');
  document.querySelector('.expand-hint').textContent = 'Show details';
}