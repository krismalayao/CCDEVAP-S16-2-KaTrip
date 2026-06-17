// -----------------------------------------------------------------------------
// START TRIP PAGE
// -----------------------------------------------------------------------------
    // ── Map ──────────────────────────────────────────────────────────────────
    function makeIcon(color) {
      return L.divIcon({
        className: '',
        html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22s14-12.37 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
                 <circle cx="14" cy="14" r="5" fill="white"/>
               </svg>`,
        iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36]
      });
    }
 
    const stops = [
      { lat: 14.8302, lon: 120.2842, color: '#9854cb', label: 'Olongapo City Hall (Origin)' },
      { lat: 14.8270, lon: 120.2800, color: '#deacf5', label: 'SM City Olongapo (Pickup 1)' },
      { lat: 14.8420, lon: 120.2720, color: '#deacf5', label: 'Subic Bay Freeport Zone Gate (Pickup 2)' },
      { lat: 14.8550, lon: 120.2650, color: '#ff3434', label: 'Subic Bay Boardwalk (Destination)' },
    ];
 
    const map = L.map('map', { zoomControl: true }).setView([14.838, 120.274], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
 
    stops.forEach(s => {
      L.marker([s.lat, s.lon], { icon: makeIcon(s.color) })
        .addTo(map)
        .bindPopup(s.label);
    });
 
    const latlngs = stops.map(s => [s.lat, s.lon]);
    L.polyline(latlngs, {
      color: '#9854cb', weight: 4, opacity: 0.7, dashArray: '8 6'
    }).addTo(map);
 
    map.fitBounds(latlngs, { padding: [40, 40] });
 
    // ── Modal ────────────────────────────────────────────────────────────────
    document.getElementById('btn-start').addEventListener('click', () => {
      document.getElementById('modal').classList.add('visible');
    });
    document.getElementById('btn-wait').addEventListener('click', () => {
      document.getElementById('modal').classList.remove('visible');
    });
    document.getElementById('btn-proceed').addEventListener('click', () => {
      document.getElementById('modal').classList.remove('visible');
      // TODO: navigate to active trip / in-progress screen
    });
 
    // ── Passenger actions ────────────────────────────────────────────────────
    function removePax(btn) {
      const row = btn.closest('.pax-row');
      row.style.transition = 'opacity 0.2s';
      row.style.opacity = '0';
      setTimeout(() => row.remove(), 200);
    }
 
    function acceptPax(btn) {
      const row = btn.closest('.pax-row');
      row.classList.remove('pending');
      // swap accept button out, leave only remove
      btn.remove();
    }
 
    // ── Mobile bottom-sheet toggle ───────────────────────────────────────────
    function toggleSheet() {
        const panel = document.getElementById('panel') // or document.querySelector('.panel')
        panel.classList.toggle('collapsed');
        document.querySelector('.expand-hint').textContent =
            panel.classList.contains('collapsed') ? 'Show details' : 'Hide details';
    }
 
    // Collapse sheet on mobile by default
    if (window.innerWidth <= 640) {
      document.getElementById('panel').classList.add('collapsed');
    }

    if (window.innerWidth <= 640) {
  const panel = document.querySelector('.panel');
  panel.classList.add('collapsed');
  document.querySelector('.expand-hint').textContent = 'Show details';
}