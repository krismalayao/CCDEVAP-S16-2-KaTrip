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

  fetch('../../backEnd/controller/passengerDashboardCardsController.php')
  .then(response => response.json())
  .then(data => {

    const container = document.querySelector('.passenger-ride-list');
    container.innerHTML = '';

    data.forEach(ride => {

      const card = `
        <div class="passenger-ride-card">
          <div class="ride-title">${ride.origin} -> ${ride.destination}</div>
          <div class="ride-info">
            Departure: ${ride.departure}<br> 
            Status: ${ride.booking_status}<br>
            Reserved Seats: ${ride.seat_reserved}
          </div>
          <a href="#" class="passenger-dashboard-details-btn">View Details</a>
        </div>
      `;

      container.innerHTML += card;
    });

  })
  .catch(err => console.log(err));

  
