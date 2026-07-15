// Setting the Functions for Each Feature
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initPhoneFormatter();
    initStaticRegistration();
    initRideDetail();
    initApplicationUploadPreview();
    initDriverApplicationSubmit();
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
            window.location.href = '../driver/driverApplication.php';
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

// Script for Driver Account Registration
function initDriverApplicationSubmit() {
    const form = document.getElementById('driver-application-form');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('.application-submit-btn');
        button.disabled = true;
        button.textContent = 'Submitting...';
        try {
            const response = await fetch('../../backEnd/registrationProcess/submitDriverApplication.php', {
                method: 'POST', body: new FormData(form), credentials: 'same-origin'
            });
            const data = await response.json();
            if (data.status !== 'success') throw new Error(data.message);
            const modal = document.getElementById('application-success-modal');
            document.getElementById('application-success-message').textContent = data.message;
            const isExistingApplication = Boolean(data.existing_application);
            const closeButton = document.getElementById('application-success-close');
            closeButton.textContent = isExistingApplication ? 'Return to Passenger Dashboard' : 'Continue to Login';
            modal.hidden = false;
            closeButton.addEventListener('click', () => {
                if (isExistingApplication) {
                    window.location.href = '../passenger/passengerDashboard.php';
                    return;
                }
                window.location.href = '../public/loginPage.php';
            });
        } catch (error) {
            alert(error.message || 'Could not submit your application.');
            button.disabled = false;
            button.textContent = 'Submit';
        }
    });
}

// Script for Browse Rides Filtering
let browseRidesData = [];
let browseRideDestinations = [];
let browseRidePickups = [];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatRideTime(value) {
  if (!value) return 'TBA';

  const timeValue = String(value);
  const [hour, minute] = timeValue.split(':');
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute || 0);

  const date = new Date(2000, 0, 1, parsedHour, parsedMinute);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Formats ride data into readable text 

function formatRideDate(value) {
  if (!value) return 'TBA';

  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
}

// Calculates Capacity details

function getCapacityDetails(ride) {
  const available = Number(ride.available_seats || 0);
  const total = Number(ride.total_seats || 0);

  if (available <= 0) {
    return { label: `${available} / ${total}`, color: '#ef4444' };
  }

  if (available <= total / 2) {
    return { label: `${available} / ${total}`, color: '#f97316' };
  }

  return { label: `${available} / ${total}`, color: '#22c55e' };
}

// Generates / loads rides

function renderRides(list) {
  const rideList = document.getElementById('ride-list');
  if (!rideList) return;

  if (!list || list.length === 0) {
    rideList.innerHTML = '<p class="browserides-empty">No rides match your filter.</p>';
    return;
  }

  rideList.innerHTML = list.map((ride) => {
    const capacity = getCapacityDetails(ride);
    const originLabel = ride.origin_name || ride.origin || 'Unknown';
    const destinationLabel = ride.destination_name || ride.destination || 'Unknown';
    const routeLabel = `${originLabel} → ${destinationLabel}`.toUpperCase();
    const timeLabel = formatRideTime(ride.departure_time || ride.departure);
    const dateLabel = formatRideDate(ride.start_date || ride.departure_date);

    return `
      <div class="browserides-ride-card">
        <div class="browserides-ride-top">
          <span class="browserides-ride-route">${routeLabel}</span>
          <button type="button" class="browserides-view-btn" data-ride-id="${ride.ride_id}">View</button>
        </div>
        <div class="browserides-ride-meta">
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">TIME:</span>
            <span class="browserides-meta-value">${timeLabel}</span>
          </div>
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">DATE:</span>
            <span class="browserides-meta-value">${dateLabel}</span>
          </div>
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">SEATS LEFT:</span>
            <span class="browserides-capacity-badge" style="background:${capacity.color}">${capacity.label}</span>
          </div>
          <div class="browserides-meta-item">
            <span class="browserides-meta-label">FARE:</span>
            <span class="browserides-meta-value">₱${Number(ride.cost || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// function that intakes the filtered arrangement of rides

function getFilteredRides() {
  const destinationInput = document.getElementById('destination-input');
  const pickupInput = document.getElementById('pickup-input');

  const destinationQuery = destinationInput ? destinationInput.value.trim() : '';
  const pickupQuery = pickupInput ? pickupInput.value.trim() : '';

  const normalizedDestination = normalizeText(destinationQuery);
  const normalizedPickup = normalizeText(pickupQuery);

  return browseRidesData.filter((ride) => {
    const origin = normalizeText(ride.origin);
    const pickupPoints = normalizeText(ride.pickup_points);
    const destination = normalizeText(ride.destination);
    const destinationName = normalizeText(ride.destination_name);

    const matchDestination = !normalizedDestination || destination.includes(normalizedDestination) || destinationName.includes(normalizedDestination);
    const matchPickup = !normalizedPickup || origin.includes(normalizedPickup) || pickupPoints.includes(normalizedPickup);

    return matchDestination && matchPickup;
  });
}

// Sorts rides in browserides by departure time

function sortByTime() {
  const sorted = [...browseRidesData];
  sorted.sort(function(a, b) {
    const aTime = String(a.departure_time || a.departure || '00:00');
    const bTime = String(b.departure_time || b.departure || '00:00');

    if (aTime < bTime) return -1;
    if (aTime > bTime) return 1;
    return 0;
  });
  return sorted;
}

// Displays ride details modal

function openRideDetailsModal(rideId) {
  fetch(`../../backEnd/controller/viewDetailsController.php?ride_id=${rideId}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert('Failed to load ride details.');
        return;
      }

      const ride = data.ride;
      const originLabel = ride.origin_name || ride.origin || 'Unknown';
      const destinationLabel = ride.destination_name || ride.destination || 'Unknown';
      const pickupPoints = ride.pickup_points || 'No pickup points listed';
      const departureTime = ride.departure_time || ride.departure || 'TBA';
      const departureDate = ride.start_date || ride.departure_date || 'TBA';
      const driverPhone = ride.phone_number || 'N/A';
      const modal = document.createElement('div');
      modal.classList.add('view-details-modal-overlay');

      modal.innerHTML = `
        <div class="view-details-modal-card">
          <button class="view-details-modal-close">&times;</button>
          <div class="view-details-modal-header">
            <span class="view-details-modal-route">
              ${originLabel.toUpperCase()} &rarr; ${destinationLabel.toUpperCase()}
            </span>
            <span class="view-details-modal-status">${ride.ride_status || 'Scheduled'}</span>
          </div>
          <div class="view-details-modal-route-section">
            <div class="view-details-modal-route-point">
              <span class="view-details-modal-dot pickup"></span>
              <strong>From:</strong>
              <span>${originLabel}</span>
            </div>
            <div class="view-details-modal-route-point">
              <span class="view-details-modal-dot destination"></span>
              <strong>To:</strong>
              <span>${destinationLabel}</span>
            </div>
          </div>
          <div class="view-details-modal-meta">
            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Departure Time</span>
              <span class="view-details-modal-value">${departureTime}</span>
            </div>
            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Date</span>
              <span class="view-details-modal-value">${departureDate}</span>
            </div>
            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Pickup Points</span>
              <span class="view-details-modal-value">${pickupPoints}</span>
            </div>
            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Driver Phone</span>
              <span class="view-details-modal-value">${driverPhone}</span>
            </div>
            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Seats Left</span>
              <span class="view-details-modal-seat">${ride.available_seats || 0} / ${ride.total_seats || 0}</span>
            </div>
          </div>
          <div class="view-details-modal-driver">
            <div class="view-details-modal-avatar"></div>
            <div>
              <p class="view-details-modal-driver-name">${ride.first_name || ''} ${ride.last_name || ''}</p>
              <small class="view-details-modal-vehicle">${ride.vehicle_model || 'Vehicle'} • ${ride.plate_number || 'N/A'}</small>
            </div>
          </div>
          <div class="view-details-modal-footer">
            <div>
              <span class="view-details-modal-label">ESTIMATED FARE</span>
              <span class="view-details-modal-price">₱${Number(ride.cost || 0).toFixed(2)}</span>
            </div>

            <button class="reserve-seat-btn" id= "reserve-seat-btn" data-ride-id="${ride.ride_id}">
              Reserve Seat
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const reserveBtn = modal.querySelector('.reserve-seat-btn');

      if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {

          const rideId = reserveBtn.dataset.rideId;

          fetch('../../backEnd/controller/reserveController.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `ride_id=${rideId}`
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              openReservationToast(data.booking_id);
            } else {
              alert(data.message);
            }
          });
        });
      }

      modal.querySelector('.view-details-modal-close').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          modal.remove();
        }
      });
    })
    .catch((error) => {
      console.error('Error fetching ride details:', error);
    });
}

// Displays reservation toast, with live animations and interaction through polling

function openReservationToast(bookingId) {
  const toast = document.createElement('div');
  toast.classList.add('reservation-toast');

  toast.innerHTML = `
    <div class="reservation-toast-card">
      <div class="reservation-loading"></div>
      <h3>Waiting for driver approval</h3>
      <p>Your reservation request has been sent.</p>
      <button class="reservation-cancel">Cancel</button>
    </div>
  `;

  document.body.appendChild(toast);

  let pollTimer;
  let stopped = false;
  const stopPolling = () => {
    stopped = true;
    if (pollTimer) clearTimeout(pollTimer);
  };
  const updateReservationStatus = async () => {
    if (stopped) return;
    try {
      const response = await fetch(`../../backEnd/controller/passengerBookingStatus.php?booking_id=${encodeURIComponent(bookingId)}`, { credentials: 'same-origin' });
      const status = await response.json();
      if (status.booking_status === 'accepted' && status.ride_status === 'ongoing') {
        toast.querySelector('h3').textContent = 'Trip started';
        toast.querySelector('p').textContent = 'The driver has started the trip.';
        toast.querySelector('.reservation-loading').remove();
        toast.querySelector('.reservation-cancel').textContent = 'Close';
        stopPolling();
        window.location.href = 'passengerDashboard.php';
      } else if (status.booking_status === 'accepted') {
        toast.querySelector('h3').textContent = 'Reservation approved';
        toast.querySelector('p').textContent = 'The driver accepted your reservation.';
        toast.querySelector('.reservation-loading').remove();
        toast.querySelector('.reservation-cancel').textContent = 'Close';
        stopPolling();
        window.location.href = 'passengerDashboard.php';
      } else if (status.booking_status === 'rejected' || status.booking_status === 'cancelled') {
        toast.querySelector('h3').textContent = status.booking_status === 'rejected' ? 'Reservation rejected' : 'Reservation cancelled';
        toast.querySelector('p').textContent = 'This reservation is no longer active.';
        toast.querySelector('.reservation-loading').remove();
        toast.querySelector('.reservation-cancel').textContent = 'Close';
        stopPolling();
      }
    } catch (error) {
      console.warn('Could not refresh reservation status:', error);
    }
    if (!stopped) pollTimer = setTimeout(updateReservationStatus, 4000);
  };
  updateReservationStatus();

  toast.querySelector('.reservation-cancel').addEventListener('click', () => {

    if (stopped) {
      toast.remove();
      return;
    }

    fetch('../../backEnd/controller/cancelController.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `booking_id=${bookingId}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        stopPolling();
        toast.remove();
      } else {
        alert(data.message);
      }
    });
  });
}

// Search bar autocomplete capability
function initBrowseRidesAutocomplete() {
  const rideList = document.getElementById('ride-list');
  const destinationInput = document.getElementById('destination-input');
  const suggestionsBox = document.getElementById('destination-suggestions');
  const destinationForm = document.getElementById('destination-form');

  const pickupInput = document.getElementById('pickup-input');
  const pickupSuggestionsBox = document.getElementById('pickup-suggestions');
  const pickupForm = document.getElementById('pickup-form');

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

  // Same idea as the destination suggestions, but for pickup points
  function showPickupSuggestions(query = '') {
    if (!pickupSuggestionsBox) return;

    const normalizedQuery = normalizeText(query);
    const suggestions = browseRidePickups.filter((pickup) => {
      if (!normalizedQuery) return true;
      return normalizeText(pickup).includes(normalizedQuery);
    }).slice(0, 5);

    if (!suggestions.length) {
      pickupSuggestionsBox.classList.remove('show');
      pickupSuggestionsBox.innerHTML = '';
      return;
    }

    pickupSuggestionsBox.innerHTML = suggestions
      .map((pickup) => `<button type="button" class="browserides-suggestion">${pickup}</button>`)
      .join('');
    pickupSuggestionsBox.classList.add('show');
  }

  function hidePickupSuggestions() {
    if (!pickupSuggestionsBox) return;
    pickupSuggestionsBox.classList.remove('show');
  }

  function applyPickupFilter(value = pickupInput.value) {
    pickupInput.value = value;
    renderRides(getFilteredRides());
  }

  rideList.addEventListener('click', (event) => {
    const viewButton = event.target.closest('.browserides-view-btn');
    if (!viewButton) return;

    event.preventDefault();
    openRideDetailsModal(viewButton.dataset.rideId);
  });

  fetch('../../backEnd/controller/browseRidesController.php')
    .then((response) => response.json())
    .then((data) => {
      browseRidesData = Array.isArray(data) ? data : [];
      browseRideDestinations = [
        ...new Set(
          browseRidesData
            .map((ride) => ride.destination_name || ride.destination)
            .filter(Boolean)
        )
      ];
      browseRidePickups = [
        ...new Set(
          browseRidesData.flatMap((ride) => {
            const items = [];
            if (ride.origin) items.push(ride.origin);
            if (ride.pickup_points) {
              String(ride.pickup_points)
                .split('|')
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => items.push(item));
            }
            return items;
          })
        )
      ];

      renderRides(getFilteredRides());

      if (pickupInput) {
        pickupInput.addEventListener('input', () => {
          showPickupSuggestions(pickupInput.value);
          applyPickupFilter(pickupInput.value);
        });
        pickupInput.addEventListener('focus', () => showPickupSuggestions(pickupInput.value));
      }

      if (pickupForm) {
        pickupForm.addEventListener('submit', (event) => {
          event.preventDefault();
          applyPickupFilter(pickupInput.value);
          hidePickupSuggestions();
        });
      }

      if (pickupSuggestionsBox) {
        pickupSuggestionsBox.addEventListener('click', (event) => {
          const suggestion = event.target.closest('.browserides-suggestion');
          if (!suggestion) return;

          pickupInput.value = suggestion.textContent.trim();
          applyPickupFilter(pickupInput.value);
          hidePickupSuggestions();
        });
      }

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
        if (pickupInput && pickupSuggestionsBox &&
            !pickupInput.contains(event.target) && !pickupSuggestionsBox.contains(event.target)) {
          hidePickupSuggestions();
        }
      });

      const filterBtns = document.querySelectorAll('.browserides-filter-btn');

      filterBtns.forEach((button) => {
        button.addEventListener('click', function () {
          filterBtns.forEach((btn) => btn.classList.remove('active'));
          this.classList.add('active');

          const panels = document.querySelectorAll('.browserides-filter-panel');
          panels.forEach((panel) => panel.classList.add('hidden'));
          document.getElementById(`panel-${this.dataset.filter}`).classList.remove('hidden');

          if (this.dataset.filter === 'departure') {
            renderRides(sortByTime());
          } else {
            renderRides(getFilteredRides());
          }
        });
      });
    })
    .catch((error) => {
      console.error('Error loading rides:', error);
      renderRides([]);
    });
}
