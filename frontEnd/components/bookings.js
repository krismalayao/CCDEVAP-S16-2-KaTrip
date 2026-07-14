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
  const statusLabel = booking => {
    if (booking.booking_status === 'cancelled' || booking.ride_status === 'cancelled') return 'Cancelled';
    if (booking.booking_status === 'rejected') return 'Rejected';
    if (booking.ride_status === 'completed') return 'Completed';
    if (booking.ride_status === 'ongoing') return 'Trip In Progress';
    if (booking.booking_status === 'accepted') return 'Driver Matched';
    return 'Awaiting Driver';
  };
  const card = (booking, group) => {
    const canCancel = group === 'pending' && booking.booking_status === 'pending';
    const driver = booking.driver_first_name ? `<div class="driver-info-snippet"><div class="driver-avatar-mini"></div><div><p class="driver-name">${esc(booking.driver_first_name)} ${esc(booking.driver_last_name)}</p><small class="vehicle-plate">${esc(booking.vehicle_model || '')} • ${esc(booking.plate_number || '')}</small></div></div>` : '';
    const badgeClass = (booking.booking_status === 'cancelled' || booking.ride_status === 'cancelled') ? 'cancelled' : booking.booking_status === 'accepted' ? 'approved' : booking.booking_status;
    return `<div class="booking-card-item ${group === 'history' ? 'history-booking-card' : ''}">
      <div class="booking-card-heading"><span class="status-badge ${esc(badgeClass)}">${esc(statusLabel(booking))}</span><span class="booking-date">${date(booking.departure_date, booking.booking_created_at)} ${esc(booking.departure || '')}</span></div>
      <div class="booking-route"><div class="route-point"><span class="dot pickup"></span><strong>From:</strong> ${esc(booking.origin)}</div><div class="route-point"><span class="dot destination"></span><strong>To:</strong> ${esc(booking.destination)}</div></div>
      ${driver}<div class="booking-card-footer"><span class="booking-price">PHP ${Number(booking.cost).toFixed(2)}</span>${canCancel ? `<button class="cancel-booking-btn" data-booking-id="${booking.booking_id}">Cancel Request</button>` : ''}</div></div>`;
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
    const button=event.target.closest('.cancel-booking-btn'); if(!button) return;
    fetch('../../backEnd/controller/cancelController.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`booking_id=${button.dataset.bookingId}`}).then(r=>r.json()).then(result=>{ if(result.success) location.reload(); else alert(result.message || 'Unable to cancel booking.'); });
  });
});
