async function loadRequests() {
    try {
        const resp = await fetch('../../backEnd/controller/getPendingRequests.php');
        const data = await resp.json();
        if (data.status !== 'success') {
            showToast(data.message || 'Failed to load requests.', 'error');
            return;
        }
        renderRequests(data.requests);
    } catch (e) {
        console.error(e);
        showToast('Could not connect to server.', 'error');
    }
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderRequests(requests) {
    const container = document.getElementById('requests-list');
    if (!requests.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No pending requests.</p></div>`;
        return;
    }

    container.innerHTML = requests.map(r => `
        <div class="trip-card" id="request-${r.booking_id}">
            <div class="trip-card-top">
                <div class="trip-route-text">
                    ${r.origin_name || r.origin}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    ${r.destination_name || r.destination}
                </div>
                <span class="status-badge status-upcoming">${formatDate(r.departure_date)} · ${r.departure}</span>
            </div>

            <div class="trip-meta">
                <div class="trip-meta-item">
                    <span class="trip-meta-label">Passenger</span>
                    <span class="trip-meta-value">${r.first_name} ${r.last_name}</span>
                </div>
                <div class="trip-meta-item">
                    <span class="trip-meta-label">Seats Requested</span>
                    <span class="trip-meta-value">${r.seat_reserved}</span>
                </div>
            </div>

            <div class="trip-card-actions">
                <button class="btn-sm btn-primary" onclick="respondToRequest(${r.booking_id}, ${r.ride_id}, 'accepted')">✓ Accept</button>
                <button class="btn-sm btn-danger" onclick="respondToRequest(${r.booking_id}, ${r.ride_id}, 'rejected')">✕ Reject</button>
            </div>
        </div>
    `).join('');
}

function respondToRequest(bookingId, rideId, status) {
    fetch('../../backEnd/controller/manageBooking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rideId, status })
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                showToast(status === 'accepted' ? 'Request accepted.' : 'Request rejected.', 'success');
                loadRequests(); // refresh list
                if (window.refreshRequestBadge) window.refreshRequestBadge(); // update navbar count immediately
            } else {
                showToast(result.error || 'Could not update this request.', 'error');
            }
        })
        .catch(err => {
            console.error('Request update failed:', err);
            showToast('Something went wrong.', 'error');
        });
}

function showToast(msg, type = 'default') {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = '';
    t.classList.add('show', `toast-${type}`);
    setTimeout(() => t.classList.remove('show', `toast-${type}`), 3000);
}

loadRequests();