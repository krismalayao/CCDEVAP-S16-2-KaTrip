// Setting the Functions for Each Feature
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initPhoneFormatter();
    initStaticRegistration();
    initRideDetail();
    initApplicationUploadPreview();
    initBrowseRidesAutocomplete();
});

// Toggling See Password Button/Icon
function initPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-button');
    const toggleIcon = document.getElementById('toggle-icon');

    if (!passwordInput || !toggleButton || !toggleIcon) return;

    toggleButton.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'bx bxs-lock-open-alt';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'bx bxs-lock-alt';
        }
    });
}

// Script for Mobile Number Input
function initPhoneFormatter() {
    const phoneInput = document.getElementById('phone_number');

    if (!phoneInput) return;

    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 3 && value.length <= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 6) {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
        
        e.target.value = value;
    });
}

// Script for testing User Registrations
function initStaticRegistration() {
    const regForm = document.getElementById("registration-form");
    const driverCheckbox = document.getElementById("katrip_driver");

    if (!regForm || !driverCheckbox) return;

    regForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (driverCheckbox.checked) {
            window.location.href = '../driver/driverApplication.html';
        } else {
            window.location.href = "loginPage.html";
        }
    });
}

// Script for displaying the ride details for each trip
function initRideDetail() {
    const ridesDatabase = {
        '1': {
            route: 'MANILA → ESPANA',
            destination: 'Espana, Manila',
            time: '7:00 am', date: '26 MAY 2026',
            capacityText: '3 / 4 Seats',
            capacityClass: 'badge-green',
            fare: '₱92.33',
            driver: 'Jose Garcia',
            vehicle: 'Honda City • ABC 1234',
            isFull: false 
        },
        '2': { route: 'MANILA → QUIAPO',
            destination: 'Quiapo, Manila',
            time: '6:30 am', date: '26 MAY 2026',
            capacityText: '2 / 4 Seats',
            capacityClass: 'badge-orange',
            fare: '₱55.00', driver: 'John Paul Santos',
            vehicle: 'Toyota Vios • XYZ 5678',
            isFull: false },
        '3': { route: 'MANILA → DIVISORIA',
            destination: 'Divisoria, Manila',
            time: '8:15 am', date: '26 MAY 2026',
            capacityText: '4 / 4 Full',
            capacityClass: 'badge-red',
            fare: '₱40.50', driver: 'Jay Laput',
            vehicle: 'Mitsubishi Mirage • QWE 4567',
            isFull: true
        }
    };

    const rideId = new URLSearchParams(window.location.search).get('id') || '1';
    const ride = ridesDatabase[rideId];
    
    const routeEl = document.getElementById('detail-route');
    if (!routeEl) return; 
    if (!ride) { routeEl.textContent = "Ride Not Found"; return; }

    const textFields = ['route', 'destination', 'time', 'date', 'fare', 'driver', 'vehicle'];
    textFields.forEach(field => {
        const el = document.getElementById(`detail-${field}`);
        if (el) el.textContent = ride[field];
    });

    const capacityEl = document.getElementById('detail-capacity');
    if (capacityEl) {
        capacityEl.textContent = ride.capacityText;
        capacityEl.className = `browserides-capacity-badge ${ride.capacityClass}`;
    }

    if (ride.isFull) {
        const statusEl = document.getElementById('detail-status');
        const reserveBtn = document.getElementById('reserve-btn');
        
        if (statusEl) {
            statusEl.textContent = "Full";
            statusEl.className = "status-badge completed";
        }
        if (reserveBtn) {
            reserveBtn.textContent = "Fully Booked";
            reserveBtn.disabled = true;
            reserveBtn.className = "contact-driver-btn reserve-action-btn badge-disabled";
        }
    }
}

// Script for displaying the driver application document uploads
function initApplicationUploadPreview() {
    document.querySelectorAll(".upload-dropzone input").forEach(input => {
        input.addEventListener("change", function() {
            const file = this.files[0];
            if (!file) return;

            const reader = new FileReader();
            const zone = this.closest(".upload-dropzone");

            reader.onload = (e) => {
                let img = zone.querySelector(".preview-image") || document.createElement("img");
                img.className = "preview-image";
                img.src = e.target.result;
                
                if (!zone.querySelector(".preview-image")) zone.appendChild(img);
                zone.classList.add("upload-preview");
            };
            reader.readAsDataURL(file);
        });
    });
}

// Script for Browse Rides Filtering
const browseRideDestinations = [
  'Espana, Manila',
  'Quiapo, Manila',
  'Divisoria, Manila'
];

const rides = [
  { id: 1, route: 'MANILA → ESPANA', destination: 'Espana, Manila', destinationSearch: 'españa', time: '7:00 am', time24: '07:00', date: '26 MAY 2026', capacity: '3 / 4', capacityColor: '#22c55e', fare: 'PHP 92.33' },
  { id: 2, route: 'MANILA → QUIAPO', destination: 'Quiapo, Manila', destinationSearch: 'quiapo', time: '6:30 am', time24: '06:30', date: '26 MAY 2026', capacity: '2 / 4', capacityColor: '#f97316', fare: 'PHP 55.00' },
  { id: 3, route: 'MANILA → DIVISORIA', destination: 'Divisoria, Manila', destinationSearch: 'divisoria', time: '8:15 am', time24: '08:15', date: '26 MAY 2026', capacity: '4 / 4', capacityColor: '#ef4444', fare: 'PHP 40.50' },
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function renderRides(list) {
  const rideList = document.getElementById('ride-list');
  if (!rideList) return;

  if (list.length === 0) {
    rideList.innerHTML = '<p class="browserides-empty">No rides match your filter.</p>';
    return;
  }

  let html = '';

  for (let i = 0; i < list.length; i++) {
    let r = list[i];
    html += `
      <div class="browserides-ride-card">
        <div class="browserides-ride-top">
          <span class="browserides-ride-route">${r.route}</span>
          <a href="rideDetails.html?id=${r.id}" class="browserides-view-btn">View</a>
        </div>
        <div class="browserides-ride-meta">
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">TIME:</span>
            <span class="browserides-meta-value">${r.time}</span>
          </div>
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">DATE:</span>
            <span class="browserides-meta-value">${r.date}</span>
          </div>
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">CAPACITY:</span>
            <span class="browserides-capacity-badge" style="background:${r.capacityColor}">${r.capacity}</span>
          </div>
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">FARE:</span>
            <span class="browserides-meta-value">${r.fare}</span>
          </div>
        </div>
      </div>
    `;
  }

  rideList.innerHTML = html;
}

function getFilteredRides() {
  const destinationInput = document.getElementById('destination-input');
  const query = destinationInput ? destinationInput.value.trim() : '';
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return rides;
  }

  return rides.filter((ride) => {
    return (
      normalizeText(ride.destination).includes(normalizedQuery) ||
      normalizeText(ride.destinationSearch).includes(normalizedQuery) ||
      normalizeText(ride.route).includes(normalizedQuery)
    );
  });
}

function sortByTime() {
  let sorted = [...rides];
  sorted.sort(function(a, b) {
    if (a.time24 < b.time24) return -1;
    if (a.time24 > b.time24) return 1;
    return 0;
  });
  return sorted;
}

function initBrowseRidesAutocomplete() {
  const rideList = document.getElementById('ride-list');
  const destinationInput = document.getElementById('destination-input');
  const suggestionsBox = document.getElementById('destination-suggestions');
  const destinationForm = document.getElementById('destination-form');

  if (!rideList || !destinationInput || !suggestionsBox || !destinationForm) return;

  function showSuggestions(query = '') {
    const normalizedQuery = normalizeText(query);
    const suggestions = browseRideDestinations.filter((destination) => {
      if (!normalizedQuery) return true;
      return normalizeText(destination).includes(normalizedQuery);
    }).slice(0, 5);

    if (!suggestions.length) {
      suggestionsBox.classList.remove('show');
      suggestionsBox.innerHTML = '';
      return;
    }

    suggestionsBox.innerHTML = suggestions
      .map((destination) => `<button type="button" class="browserides-suggestion">${destination}</button>`)
      .join('');
    suggestionsBox.classList.add('show');
  }

  function hideSuggestions() {
    suggestionsBox.classList.remove('show');
  }

  function applyDestinationFilter(value = destinationInput.value) {
    destinationInput.value = value;
    renderRides(getFilteredRides());
  }

  renderRides(rides);

  destinationInput.addEventListener('focus', () => showSuggestions(destinationInput.value));
  destinationInput.addEventListener('input', () => {
    showSuggestions(destinationInput.value);
    applyDestinationFilter(destinationInput.value);
  });

  destinationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyDestinationFilter(destinationInput.value);
    hideSuggestions();
  });

  suggestionsBox.addEventListener('click', (event) => {
    const suggestion = event.target.closest('.browserides-suggestion');
    if (!suggestion) return;

    destinationInput.value = suggestion.textContent.trim();
    applyDestinationFilter(destinationInput.value);
    hideSuggestions();
  });

  document.addEventListener('click', (event) => {
    if (!destinationInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
      hideSuggestions();
    }
  });

  let filterBtns = document.querySelectorAll('.browserides-filter-btn');

  for (let i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function() {
      for (let j = 0; j < filterBtns.length; j++) {
        filterBtns[j].classList.remove('active');
      }

      this.classList.add('active');

      let panels = document.querySelectorAll('.browserides-filter-panel');
      for (let k = 0; k < panels.length; k++) {
        panels[k].classList.add('hidden');
      }
      document.getElementById('panel-' + this.dataset.filter).classList.remove('hidden');

      if (this.dataset.filter === 'departure') {
        renderRides(sortByTime());
      } else {
        renderRides(getFilteredRides());
      }
    });
  }
}
