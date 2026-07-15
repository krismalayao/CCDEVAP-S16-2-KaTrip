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

  // Helper: build a human readable departure label from date + time
  function formatDeparture(dateValue, timeValue) {
    if (!dateValue && !timeValue) return 'TBA';

    const normalizedDate = dateValue ? String(dateValue).trim() : '';
    const normalizedTime = timeValue ? String(timeValue).trim() : '00:00:00';
    const date = new Date(`${normalizedDate}T${normalizedTime}`);

    if (isNaN(date.getTime())) {
      return [normalizedDate, normalizedTime].filter(Boolean).join(' ').trim() || 'TBA';
    }

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
  .then(payload => {

    const rides = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload?.rides) ? payload.rides : []);
    const hasMore = Array.isArray(payload) ? false : Boolean(payload?.has_more);

    const container = document.querySelector('.passenger-ride-list');
    container.innerHTML = '';

    // Empty dataset
    if (!rides || rides.length === 0) {
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

    rides.forEach(ride => {

      const status = getStatusBadge(ride.booking_status);
      const departureLabel = formatDeparture(ride.departure_date, ride.departure);
      const seatLabel = Number(ride.seat_reserved) === 1 ? 'Seat Reserved' : 'Seats Reserved';
      const originLabel = ride.origin_name || ride.origin || 'Unknown';
      const destinationLabel = ride.destination_name || ride.destination || 'Unknown';

      const card = `
        <div class="passenger-ride-card">
          <div class="ride-card-top">
            <span class="ride-card-route">
              ${originLabel} <span class="ride-card-arrow">&rarr;</span> ${destinationLabel}
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

    if (hasMore) {
      container.innerHTML += `
        <div class="passenger-ride-card">
          <a href="myBookings.php" class="passenger-dashboard-details-btn">View All Bookings</a>
        </div>
      `;
    }

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
      const originLabel = ride.origin_name || ride.origin || 'Unknown';
      const destinationLabel = ride.destination_name || ride.destination || 'Unknown';
      const pickupPoints = ride.pickup_points || 'No pickup points listed';
      const departureTime = ride.departure_time || ride.departure || 'TBA';
      const departureDate = ride.start_date || ride.departure_date || 'TBA';
      const driverPhone = ride.phone_number || 'N/A';

      const modal = document.createElement("div");
      modal.classList.add("view-details-modal-overlay");

      modal.innerHTML = `
        <div class="view-details-modal-card">

          <button class="view-details-modal-close">&times;</button>

          <div class="view-details-modal-header">
            <span class="view-details-modal-route">
              ${originLabel.toUpperCase()} &rarr; ${destinationLabel.toUpperCase()}
            </span>

            <span class="view-details-modal-status">
              ${ride.ride_status}
            </span>
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
              <span class="view-details-modal-value">
                ${departureTime}
              </span>
            </div>


            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Date</span>
              <span class="view-details-modal-value">
                ${departureDate}
              </span>
            </div>


            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Pickup Points</span>
              <span class="view-details-modal-value">
                ${pickupPoints}
              </span>
            </div>


            <div class="view-details-modal-meta-item">
              <span class="view-details-modal-label">Driver Phone</span>
              <span class="view-details-modal-value">
                ${driverPhone}
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
