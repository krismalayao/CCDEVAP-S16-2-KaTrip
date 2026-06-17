// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  from: null,   // { display, lat, lon }
  to: null,
  pickups: [{ id: 1, value: '', loc: null }, { id: 2, value: '', loc: null }],
  routeDistance: null, // km
  routeDuration: null, // seconds
};
let pickupIdCounter = 3;
 
const BASE_FARE = 50;
const FARE_PER_KM = 15;
 
// ─── Map setup ───────────────────────────────────────────────────────────────
const map = L.map('map', { zoomControl: true }).setView([14.5995, 120.9842], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);
 
let fromMarker = null, toMarker = null, routeLayer = null;
const pickupMarkers = {};
 
function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22s14-12.37 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/><circle cx="14" cy="14" r="5" fill="white"/></svg>`,
    iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36]
  });
}
 
// ─── Geocoding via Claude API (avoids iframe CORS block on Nominatim) ────────
const acTimers = {};
 
async function searchPlaces(q) {
  if (!q || q.length < 3) return [];
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `You are a geocoding assistant. When given a place search query, search Nominatim for matching places in the Philippines and return ONLY a JSON array (no markdown, no explanation) with up to 5 results. Each result must have: name (short place name), display_name (full address), lat (number), lon (number). If no results, return [].`,
        messages: [{ role: "user", content: `Search Nominatim OpenStreetMap for: "${q}" in the Philippines. Return only the JSON array.` }]
      })
    });
    const data = await resp.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    return JSON.parse(clean.slice(start, end + 1));
  } catch(e) { console.error(e); return []; }
}
 
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
  el.innerHTML = results.map((r, i) => {
    const name = r.name || r.display_name.split(',')[0];
    const addr = r.display_name;
    return `<div class="autocomplete-item" onmousedown="selectLoc('${side}',${i})" data-idx="${i}">
      <span class="ac-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
      <div><div class="ac-name">${name}</div><div class="ac-addr">${addr}</div></div>
    </div>`;
  }).join('');
  el._results = results;
  el.style.display = 'block';
}
 
function selectLoc(side, idx) {
  const el = document.getElementById(`ac-${side}`);
  const r = el._results[idx];
  const loc = { display: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon), name: r.name || r.display_name.split(',')[0] };
  document.getElementById(`input-${side}`).value = loc.name || loc.display;
  state[side] = loc;
  el.style.display = 'none';
  updateMapMarker(side, loc);
  tryRoute();
}
 
function hideAc(side) { document.getElementById(`ac-${side}`).style.display = 'none'; }
function onLocFocus(side) { const v = document.getElementById(`input-${side}`).value; if (v.length >= 3) onLocInput(side); }
function onLocBlur(side) { setTimeout(() => hideAc(side), 200); }
 
// ─── Swap ─────────────────────────────────────────────────────────────────────
function swapLocations() {
  [state.from, state.to] = [state.to, state.from];
  document.getElementById('input-from').value = state.from ? (state.from.name || state.from.display) : '';
  document.getElementById('input-to').value = state.to ? (state.to.name || state.to.display) : '';
  if (state.from) updateMapMarker('from', state.from);
  if (state.to) updateMapMarker('to', state.to);
  tryRoute();
}
 
// ─── Map markers ─────────────────────────────────────────────────────────────
function updateMapMarker(side, loc) {
  if (side === 'from') {
    if (fromMarker) map.removeLayer(fromMarker);
    fromMarker = L.marker([loc.lat, loc.lon], { icon: makeIcon('#a855f7') }).addTo(map);
  } else {
    if (toMarker) map.removeLayer(toMarker);
    toMarker = L.marker([loc.lat, loc.lon], { icon: makeIcon('#ef4444') }).addTo(map);
  }
  fitMapBounds();
}
 
function fitMapBounds() {
  const pts = [];
  if (state.from) pts.push([state.from.lat, state.from.lon]);
  if (state.to) pts.push([state.to.lat, state.to.lon]);
  state.pickups.forEach(p => { if (p.loc) pts.push([p.loc.lat, p.loc.lon]); });
  if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40] });
  else if (pts.length === 1) map.setView(pts[0], 14);
}
 
// ─── Route estimation via Claude API ─────────────────────────────────────────
async function tryRoute() {
  if (!state.from || !state.to) return;
  document.getElementById('travel-time').innerHTML = 'Calculating<span class="spinner"></span>';
 
  // Draw a straight-line polyline as visual placeholder
  if (routeLayer) map.removeLayer(routeLayer);
  routeLayer = L.polyline([
    [state.from.lat, state.from.lon],
    [state.to.lat, state.to.lon]
  ], { color: '#a855f7', weight: 4, opacity: 0.6, dashArray: '8 6' }).addTo(map);
  fitMapBounds();
 
  // Estimate distance & duration via Claude
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        system: `You are a routing assistant. Given two locations with coordinates, estimate the driving distance in km and duration in minutes via typical Philippine roads. Return ONLY JSON: {"distance_km": number, "duration_min": number}. No markdown.`,
        messages: [{
          role: "user",
          content: `From: ${state.from.display} (${state.from.lat}, ${state.from.lon})\nTo: ${state.to.display} (${state.to.lat}, ${state.to.lon})`
        }]
      })
    });
    const data = await resp.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("").replace(/```json|```/g,"").trim();
    const j = JSON.parse(text);
    state.routeDistance = j.distance_km;
    state.routeDuration = j.duration_min * 60;
    updateTravelTime();
    updateFare();
  } catch(e) {
    // Fallback: haversine straight-line estimate
    const R = 6371;
    const dLat = (state.to.lat - state.from.lat) * Math.PI / 180;
    const dLon = (state.to.lon - state.from.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(state.from.lat*Math.PI/180)*Math.cos(state.to.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    state.routeDistance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.3;
    state.routeDuration = (state.routeDistance / 40) * 3600;
    updateTravelTime();
    updateFare();
  }
}
 
function updateTravelTime() {
  if (!state.routeDuration) return;
  const mins = Math.round(state.routeDuration / 60);
  const h = Math.floor(mins / 60), m = mins % 60;
  document.getElementById('travel-time').textContent = h > 0 ? `${h} hr ${m} min` : `${m} min`;
}
 
function updateFare() {
  if (!state.routeDistance) { document.getElementById('fare-display').textContent = 'PHP —'; return; }
  const pax = parseInt(document.getElementById('passengers').value) || 1;
  const fare = Math.round((BASE_FARE + state.routeDistance * FARE_PER_KM) * (1 + (pax - 1) * 0.15));
  document.getElementById('fare-display').textContent = `PHP ${fare.toFixed(2)}`;
}
 
document.getElementById('passengers').addEventListener('input', updateFare);
 
// ─── Pickup locations ─────────────────────────────────────────────────────────
function renderPickups() {
  const list = document.getElementById('pickup-list');
  list.innerHTML = state.pickups.map(p => `
    <div class="pickup-row" id="pickup-row-${p.id}">
      <div class="purple-dot"></div>
      <div class="pickup-input-wrap">
        <input class="pickup-input" id="pickup-input-${p.id}" value="${p.value}" placeholder="Pickup Location" autocomplete="off"
          oninput="onPickupInput(${p.id})" onfocus="onPickupFocus(${p.id})" onblur="onPickupBlur(${p.id})"/>
        <button class="clear-btn" onmousedown="clearPickup(${p.id})">×</button>
        <div class="autocomplete-list" id="ac-pickup-${p.id}" style="display:none;"></div>
      </div>
      <span class="drag-handle">⠿</span>
    </div>
  `).join('');
}
 
function onPickupInput(id) {
  const val = document.getElementById(`pickup-input-${id}`).value;
  const p = state.pickups.find(x => x.id === id);
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
  el.innerHTML = results.map((r, i) => {
    const name = r.name || r.display_name.split(',')[0];
    return `<div class="autocomplete-item" onmousedown="selectPickupLoc(${id},${i})">
      <span class="ac-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
      <div><div class="ac-name">${name}</div><div class="ac-addr">${r.display_name}</div></div>
    </div>`;
  }).join('');
  el._results = results;
  el.style.display = 'block';
}
 
function selectPickupLoc(id, idx) {
  const el = document.getElementById(`ac-pickup-${id}`);
  const r = el._results[idx];
  const loc = { display: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon), name: r.name || r.display_name.split(',')[0] };
  const p = state.pickups.find(x => x.id === id);
  if (p) { p.value = loc.name; p.loc = loc; }
  document.getElementById(`pickup-input-${id}`).value = loc.name;
  el.style.display = 'none';
  if (pickupMarkers[id]) map.removeLayer(pickupMarkers[id]);
  pickupMarkers[id] = L.marker([loc.lat, loc.lon], { icon: makeIcon('#d946ef') }).addTo(map).bindPopup(`Pickup: ${loc.name}`);
  fitMapBounds();
}
 
function clearPickup(id) {
  const p = state.pickups.find(x => x.id === id);
  if (p) { p.value = ''; p.loc = null; }
  if (pickupMarkers[id]) { map.removeLayer(pickupMarkers[id]); delete pickupMarkers[id]; }
  renderPickups();
}
 
function onPickupFocus(id) { const v = document.getElementById(`pickup-input-${id}`).value; if (v.length >= 3) onPickupInput(id); }
function onPickupBlur(id) { setTimeout(() => { const el = document.getElementById(`ac-pickup-${id}`); if (el) el.style.display = 'none'; }, 200); }
 
function addPickup() {
  state.pickups.push({ id: pickupIdCounter++, value: '', loc: null });
  renderPickups();
}
 
// ─── Date default ─────────────────────────────────────────────────────────────
const today = new Date();
document.getElementById('ride-date').value = today.toISOString().split('T')[0];
 
// ─── Create Ride ──────────────────────────────────────────────────────────────
function createRide() {
  if (!state.from || !state.to) { showToast('Please set origin and destination.'); return; }
  showToast('Ride created! 🎉');
}
 
// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
 
// ─── Init ─────────────────────────────────────────────────────────────────────
renderPickups();