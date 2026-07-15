// Chart Data Distribution
fetch("../../backEnd/controller/passengerDashboardController.php")
  .then(res => res.json())
  .then(totals => {

    const ridesCtx = document.getElementById('rides-chart');

    new Chart(ridesCtx, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Rides Completed',
          data: totals
        }]
      }
    });
  });

  // Helper: This wil turn a raw departure value into smth like "May 26, 2026 • 7:00 AM" string
  function formatDeparture(value) {
    if (!value) return 'TBA';

    const normalized = String(value).replace(' ', 'T');
    const date = new Date(normalized);

    if (isNaN(date.getTime())) return String(value);

    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${datePart} • ${timePart}`;
  }

  // Helper: map a booking_status value to a label + a CSS class for the badge
  function getStatusBadge(status) {
    const normalized = String(status || '').toLowerCase();

    const statusMap = {
      pending: { label: 'Pending', className: 'ride-status-pending' },
      accepted: { label: 'Accepted', className: 'ride-status-accepted' },
      ongoing: { label: 'Ongoing', className: 'ride-status-ongoing' },
      completed: { label: 'Completed', className: 'ride-status-completed' },
      rejected: { label: 'Rejected', className: 'ride-status-cancelled' },
      cancelled: { label: 'Cancelled', className: 'ride-status-cancelled' }
    };

    return statusMap[normalized] || { label: status || 'Unknown', className: 'ride-status-pending' };
  }

  // Upcoming Rides Card Generator
  fetch('../../backEnd/controller/passengerDashboardCardsController.php')
  .then(response => response.json())
  .then(data => {

    const container = document.querySelector('.passenger-ride-list');
    container.innerHTML = '';

    // Empty dataset
    if (!data || data.length === 0) {
      const emptyCard = `
        <div class="passenger-ride-card empty">
          <div class="ride-title">No Upcoming Rides</div>
          <div class="ride-info">
            You don’t have any rides scheduled yet.
          </div>
        </div>
      `;
      container.innerHTML = emptyCard;
      return;
    }

    data.forEach(ride => {

      const status = getStatusBadge(ride.booking_status);
      const departureLabel = formatDeparture(ride.departure);
      const seatLabel = Number(ride.seat_reserved) === 1 ? 'Seat Reserved' : 'Seats Reserved';

      const card = `
        <div class="passenger-ride-card">
          <div class="ride-card-top">
            <span class="ride-card-route">
              ${ride.origin} <span class="ride-card-arrow">&rarr;</span> ${ride.destination}
            </span>
            <span class="ride-card-status ${status.className}">${status.label}</span>
          </div>

          <div class="ride-card-meta">
            <div class="ride-card-meta-item">
              <span class="ride-card-meta-label">Departure</span>
              <span class="ride-card-meta-value">${departureLabel}</span>
            </div>
            <div class="ride-card-meta-item">
              <span class="ride-card-meta-label">${seatLabel}</span>
              <span class="ride-card-meta-value">${ride.seat_reserved}</span>
            </div>
          </div>

          <a href="#" class="passenger-dashboard-details-btn" data-ride-id="${ride.ride_id}">View Details</a>
        </div>
      `;

      container.innerHTML += card;
    });

  })
  .catch(err => console.log(err));

  // View Details Modal Generator
  document.addEventListener("click", (e) => {
  if (!(e.target.classList.contains("passenger-dashboard-details-btn"))) {
    return;
  }

  e.preventDefault();
  const rideId = e.target.dataset.rideId;

  fetch(`../../backEnd/controller/viewDetailsController.php?ride_id=${rideId}`)
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        alert("Failed to load ride details.");
        return;
      }

      const ride = data.ride;

      const modal = document.createElement("div");
      modal.classList.add("view-details-modal-overlay");

      modal.innerHTML = `
        <div class="view-details-modal-card">

          <button class="view-details-modal-close">&times;</button>

          <div class="view-details-modal-header">
            <span class="view-details-modal-route">
              ${ride.origin.toUpperCase()} &rarr; ${ride.destination.toUpperCase()}
            </span>

            <span class="view-details-modal-status">
              ${ride.ride_status}
            </span>
          </div>


          <div class="view-details-modal-route-section">

            <div class="view-details-modal-route-point">
              <span class="view-details-modal-dot pickup"></span>
              <strong>From:</strong>
              <span>${ride.origin}</span>
            </div>

            <div class="view-details-modal-route-point">
              <span class="view-details-modal-dot destination"></span>
              <strong>To:</strong>
              <span>${ride.destination}</span>
            </div>

          </div>


          <div class="view-details-modal-meta">

            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Departure Time</span>
              <span class="view-details-modal-value">
                ${ride.departure_time}
              </span>
            </div>


            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Date</span>
              <span class="view-details-modal-value">
                ${ride.start_date}
              </span>
            </div>


            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Seats</span>
              <span class="view-details-modal-seat">
                ${ride.available_seats} / ${ride.total_seats}
              </span>
            </div>

          </div>


          <div class="view-details-modal-driver">

            <div class="view-details-modal-avatar"></div>

            <div>
              <p class="view-details-modal-driver-name">
                ${ride.first_name} ${ride.last_name}
              </p>

              <small class="view-details-modal-vehicle">
                ${ride.vehicle_model} • ${ride.plate_number}
              </small>
            </div>

          </div>


          <div class="view-details-modal-footer">

            <div>
              <span class="view-details-modal-label">
                ESTIMATED FARE
              </span>

              <span class="view-details-modal-price">
                ₱${ride.cost}
              </span>
            </div>

          </div>

        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector(".view-details-modal-close")
        .addEventListener("click", () => {
          modal.remove();
        });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    })
    .catch(error => {
      console.error("Error fetching ride details:", error);
    });
});
