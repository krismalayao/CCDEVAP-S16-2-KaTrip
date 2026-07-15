document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    panels.forEach(p => p.classList.toggle('active', p.id === tab.dataset.tab));
  }));

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = (scheduled, booked) => {
    const value = scheduled || (booked ? String(booked).slice(0, 10) : '');
    return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'}) : '';
  };
  const time = value => String(value || '').slice(0, 5);
  const statusLabel = booking => {
    if (booking.booking_status === 'cancelled' || booking.ride_status === 'cancelled') return 'Cancelled';
    if (booking.booking_status === 'rejected') return 'Rejected';
    if (booking.ride_status === 'completed') return 'Completed';
    if (booking.ride_status === 'ongoing') return 'Trip In Progress';
    if (booking.booking_status === 'accepted') return 'Driver Matched';
    return 'Awaiting Driver';
  };

  const openRideDetailsModal = rideId => {
    fetch(`../../backEnd/controller/viewDetailsController.php?ride_id=${encodeURIComponent(rideId)}`)
      .then(response => response.json())
      .then(data => {
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
              <span class="view-details-modal-status">${ride.ride_status || 'scheduled'}</span>
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
                <span class="view-details-modal-label">Seats</span>
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
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.view-details-modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', event => {
          if (event.target === modal) modal.remove();
        });
      })
      .catch(error => {
        console.error('Error fetching ride details:', error);
      });
  };

  const card = (booking, group) => {
    const canCancel = group === 'pending' && booking.booking_status === 'pending';
    const showViewDetails = group === 'approved' && booking.booking_status === 'accepted' && ['scheduled', 'ongoing'].includes(booking.ride_status);
    const driver = booking.driver_first_name ? `<div class="driver-info-snippet"><div class="driver-avatar-mini"></div><div><p class="driver-name">${esc(booking.driver_first_name)} ${esc(booking.driver_last_name)}</p><small class="vehicle-plate">${esc(booking.vehicle_model || '')} • ${esc(booking.plate_number || '')}</small></div></div>` : '';
    const badgeClass = (booking.booking_status === 'cancelled' || booking.ride_status === 'cancelled') ? 'cancelled' : booking.booking_status === 'accepted' ? 'approved' : booking.booking_status;
    return `<div class="booking-card-item ${group === 'history' ? 'history-booking-card' : ''}">
      <div class="booking-card-heading"><span class="status-badge ${esc(badgeClass)}">${esc(statusLabel(booking))}</span><span class="booking-date">${date(booking.departure_date, booking.booking_created_at)} ${esc(time(booking.departure))}</span></div>
      <div class="booking-route"><div class="route-point"><span class="dot pickup"></span><strong>From:</strong> ${esc(booking.origin)}</div><div class="route-point"><span class="dot destination"></span><strong>To:</strong> ${esc(booking.destination)}</div></div>
      ${driver}<div class="booking-card-footer"><span class="booking-price">PHP ${Number(booking.cost).toFixed(2)}</span>${showViewDetails ? `<button class="passenger-dashboard-details-btn booking-view-details-btn" data-ride-id="${booking.ride_id}">View Details</button>` : ''}${canCancel ? `<button class="cancel-booking-btn" data-booking-id="${booking.booking_id}">Cancel Request</button>` : ''}</div></div>`;
  };
  const render = (id, items, group) => {
    const el=document.getElementById(id);
    const emptyText = group === 'pending' ? 'No pending bookings yet.' : group === 'approved' ? 'No approved bookings yet.' : 'No booking history yet.';
    el.innerHTML=items.length ? items.map(b=>card(b,group)).join('') : `<div class="empty-state">${emptyText}</div>`;
  };
  fetch('../../backEnd/controller/passengerBookingsController.php', {credentials:'same-origin'}).then(r=>r.json()).then(bookings => {
    if (!Array.isArray(bookings)) throw new Error(bookings.error || 'Could not load bookings');
    render('pending', bookings.filter(b=>b.booking_status==='pending'), 'pending');
    render('approved', bookings.filter(b=>b.booking_status==='accepted' && ['scheduled','ongoing'].includes(b.ride_status)), 'approved');
    render('history', bookings.filter(b=>['completed','cancelled','rejected'].includes(b.booking_status) || ['completed','cancelled'].includes(b.ride_status)), 'history');
  }).catch(error => { console.error(error); document.querySelectorAll('.tab-panel').forEach(p=>p.innerHTML='<div class="empty-state">Unable to load bookings.</div>'); });
  document.addEventListener('click', event => {
    const detailsButton = event.target.closest('.booking-view-details-btn');
    if (detailsButton) {
      event.preventDefault();
      openRideDetailsModal(detailsButton.dataset.rideId);
      return;
    }

    const button=event.target.closest('.cancel-booking-btn'); if(!button) return;
    fetch('../../backEnd/controller/cancelController.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`booking_id=${button.dataset.bookingId}`}).then(r=>r.json()).then(result=>{ if(result.success) location.reload(); else alert(result.message || 'Unable to cancel booking.'); });
  });
});