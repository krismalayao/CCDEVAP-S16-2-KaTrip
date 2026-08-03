function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

fetch("../../backEnd/controller/passengerDashboardController.php")
  .then(res => res.json())
  .then(payload => {
    const monthlySpend = Array.isArray(payload?.monthly_spend) ? payload.monthly_spend : Array(12).fill(0);
    const locationSpend = Array.isArray(payload?.location_spend) ? payload.location_spend : [];

    const avgTripEl = document.getElementById('avg-per-trip');
    const avgLocationEl = document.getElementById('avg-per-location');

    if (avgTripEl) avgTripEl.textContent = formatCurrency(payload?.average_per_trip);
    if (avgLocationEl) avgLocationEl.textContent = formatCurrency(payload?.average_per_location);

    const rootStyles = getComputedStyle(document.documentElement);
    const chartTextColor = rootStyles.getPropertyValue('--text-primary').trim();
    const chartPurple = rootStyles.getPropertyValue('--purple').trim();
    const chartPurpleDark = rootStyles.getPropertyValue('--purple-dark').trim();
    const chartFaint = rootStyles.getPropertyValue('--purple-faint').trim();
    const isDarkMode = document.documentElement.dataset.theme === 'dark';
    const chartGridColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(100, 55, 160, 0.12)';

    const spendCtx = document.getElementById('spend-chart');
    if (spendCtx) {
      new Chart(spendCtx, {
        type: 'bar',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Amount Spent',
            data: monthlySpend,
            backgroundColor: isDarkMode ? '#7aa2ff' : '#4f7cff',
            borderColor: isDarkMode ? '#95b6ff' : '#2f5ad9',
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: chartTextColor } }
          },
          scales: {
            x: {
              ticks: { color: chartTextColor },
              grid: { color: chartGridColor }
            },
            y: {
              ticks: {
                color: chartTextColor,
                callback: value => `PHP ${Number(value).toLocaleString()}`
              },
              beginAtZero: true,
              grid: { color: chartGridColor }
            }
          }
        }
      });
    }

    const locationCtx = document.getElementById('location-chart');
    if (locationCtx) {
      const labels = locationSpend.length ? locationSpend.map(item => item.location) : ['No Data'];
      const values = locationSpend.length ? locationSpend.map(item => Number(item.total_spent || 0)) : [1];

      new Chart(locationCtx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: locationSpend.length
              ? [
                  '#4f7cff',
                  '#2aa8a1',
                  '#ff8f5a',
                  '#7a6bff',
                  '#f4c95d'
                ]
              : [chartFaint],
            borderWidth: 0
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: chartTextColor }
            },
            tooltip: {
              callbacks: {
                label: context => {
                  if (!locationSpend.length) return 'No completed rides yet';
                  return `${context.label}: ${formatCurrency(context.raw)}`;
                }
              }
            }
          }
        }
      });
    }
  })
  .catch(error => {
    console.error('Unable to load passenger analytics:', error);
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
      const totalSeats = Number(ride.total_seats || 0);
      const availableSeats = Number(ride.available_seats || 0);
      const occupiedSeats = Math.max(0, totalSeats - availableSeats);

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
              <span class="view-details-modal-label">Seats Occupied</span>
              <span class="view-details-modal-seat">
                ${occupiedSeats} / ${totalSeats}
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
