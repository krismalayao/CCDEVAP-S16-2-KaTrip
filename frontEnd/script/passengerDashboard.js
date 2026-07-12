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

    // Dataset has contents
    data.forEach(ride => {

      const card = `
        <div class="passenger-ride-card">
          <div class="ride-title">${ride.origin} -> ${ride.destination}</div>
          <div class="ride-info">
            Departure: ${ride.departure}<br> 
            Status: ${ride.booking_status}<br>
            Reserved Seats: ${ride.seat_reserved}
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

  

  
