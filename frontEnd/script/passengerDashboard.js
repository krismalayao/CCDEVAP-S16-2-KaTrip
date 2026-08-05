function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const ROUTE_ARROW_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

function renderSpendTrend(monthlySpend) {
  const badgeEl = document.getElementById('spend-trend-badge');
  if (!badgeEl) return;

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;

  const current = Number(monthlySpend[currentMonthIdx] || 0);
  const previous = Number(monthlySpend[prevMonthIdx] || 0);

  if (previous === 0) {
    badgeEl.textContent = current > 0 ? 'New spending this month' : 'No spending yet';
    badgeEl.className = 'spend-trend-badge neutral';
    return;
  }

  const percentChange = ((current - previous) / previous) * 100;
  const rounded = Math.abs(Math.round(percentChange));
  const isUp = percentChange > 0;
  const isFlat = rounded === 0;

  badgeEl.textContent = isFlat
    ? 'Same as last month'
    : `${isUp ? '▲' : '▼'} ${rounded}% vs last month`;
  badgeEl.className = `spend-trend-badge ${isFlat ? 'neutral' : (isUp ? 'up' : 'down')}`;
}

function renderMostFrequentRoute(route) {
  const el = document.getElementById('most-frequent-route');
  if (!el) return;

  if (!route) {
    el.textContent = 'No rides yet';
    return;
  }

  el.innerHTML = `${route.origin} <span class="ride-card-arrow">${ROUTE_ARROW_SVG}</span> ${route.destination}`;
  el.title = `${route.ride_count} ride${route.ride_count === 1 ? '' : 's'}`;
}

fetch("../../backEnd/controller/passengerDashboardController.php")
  .then(res => res.json())
  .then(payload => {
    const monthlySpend = Array.isArray(payload?.monthly_spend) ? payload.monthly_spend : Array(12).fill(0);
const monthlyRideCount = Array.isArray(payload?.monthly_ride_count) ? payload.monthly_ride_count : Array(12).fill(0);

    const avgTripEl = document.getElementById('avg-per-trip');
    const avgLocationEl = document.getElementById('avg-per-location');

    if (avgTripEl) avgTripEl.textContent = formatCurrency(payload?.average_per_trip);
    if (avgLocationEl) avgLocationEl.textContent = formatCurrency(payload?.average_per_location);

    renderSpendTrend(monthlySpend);
    renderMostFrequentRoute(payload?.most_frequent_route);

    const rootStyles = getComputedStyle(document.documentElement);
    const chartTextColor = rootStyles.getPropertyValue('--text-primary').trim();
    const chartFaint = rootStyles.getPropertyValue('--purple-faint').trim();
    const isDarkMode = document.documentElement.dataset.theme === 'dark';
    const chartGridColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(100, 55, 160, 0.12)';

    const spendCtx = document.getElementById('spend-chart');
    if (spendCtx) {
      const now = new Date();
      const last3Months = [2, 1, 0].map(offset => {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        return {
          label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: monthlySpend[d.getMonth()]
        };
      });

      new Chart(spendCtx, {
        type: 'bar',
        data: {
          labels: last3Months.map(m => m.label),
          datasets: [{
            label: 'Amount Spent',
            data: last3Months.map(m => m.value),
            backgroundColor: last3Months.map((m, i) =>
              i === 2
                ? (isDarkMode ? '#c9a4f5' : '#6437a0')       // current month — darker
                : (isDarkMode ? 'rgba(201,164,245,0.4)' : 'rgba(100,55,160,0.35)') // past — muted
            ),
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 32
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` PHP ${Number(ctx.raw).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
              }
            },
            datalabels: false
          },
          scales: {
            x: {
              display: false,
              beginAtZero: true,
              ticks: {
                color: chartTextColor,
                callback: value => `₱${Number(value).toLocaleString()}`
              },
              grid: { color: chartGridColor },
              border: { display: false }
            },
            y: {
              ticks: { color: chartTextColor },
              grid: { display: false },
              border: { display: false }
            }
          }
        },
          animation: {
          onComplete: function() {
            const chart = this;
            const ctx = chart.ctx;
            ctx.font = 'bold 12px Helvetica Now, system-ui';
            ctx.fillStyle = chartTextColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            chart.data.datasets.forEach((dataset, i) => {
              chart.getDatasetMeta(i).data.forEach((bar, idx) => {
                const value = dataset.data[idx];
                if (value > 0) {
                  ctx.fillText(
                    `PHP ${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                    bar.x + 6,
                    bar.y
                  );
                }
              });
            });
          }
        }
      });
    }
    

    // Combo chart: rides per month (bars) + average fare per month (line)
    const locationCtx = document.getElementById('location-chart');
    if (locationCtx) {
      const hasAnyRides = monthlyRideCount.some(count => count > 0);
      const avgFarePerMonth = monthlyRideCount.map((count, i) =>
        count > 0 ? monthlySpend[i] / count : null
      );

      new Chart(locationCtx, {
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [
            {
              type: 'bar',
              label: 'Rides',
              data: monthlyRideCount,
              backgroundColor: isDarkMode ? 'rgba(152, 84, 203, 0.55)' : 'rgba(100, 55, 160, 0.55)',
              borderRadius: 5,
              maxBarThickness: 28,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: 'Avg Fare',
              data: avgFarePerMonth,
              spanGaps: true,
              borderColor: isDarkMode ? '#f4c95d' : '#e07a1f',
              backgroundColor: isDarkMode ? '#f4c95d' : '#e07a1f',
              pointRadius: 3,
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: chartTextColor, usePointStyle: true, pointStyle: 'circle' }
            },
            tooltip: {
              callbacks: {
                label: context => {
                  if (!hasAnyRides) return 'No completed rides yet';
                  if (context.dataset.type === 'line') {
                    return context.raw == null ? 'No rides that month' : ` Avg fare: ${formatCurrency(context.raw)}`;
                  }
                  return ` ${context.raw} ride${context.raw === 1 ? '' : 's'}`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: chartTextColor },
              grid: { display: false },
              border: { display: false }
            },
            y: {
              position: 'left',
              beginAtZero: true,
              ticks: { color: chartTextColor, precision: 0 },
              grid: { color: chartGridColor },
              border: { display: false },
              title: { display: true, text: 'Rides', color: chartTextColor, font: { size: 11 } }
            },
            y1: {
              position: 'right',
              beginAtZero: true,
              ticks: {
                color: chartTextColor,
                callback: value => `₱${Number(value).toLocaleString()}`
              },
              grid: { display: false },
              border: { display: false },
              title: { display: true, text: 'Avg Fare', color: chartTextColor, font: { size: 11 } }
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
          <img src="../../frontEnd/src/images/no-car1.svg" alt="No Upcoming Rides" class="empty-state-image" width="30%" height="auto">
          <div class="ride-title">No Upcoming Rides</div>
          <div class="ride-info">
            You don't have any rides scheduled yet.
          </div>
          <button class="reserve-seat-btn" onclick="window.location.href='browseRides.php'">Browse Rides</button>
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
                PHP ${ride.cost}
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
