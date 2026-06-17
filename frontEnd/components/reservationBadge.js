/* Reservation status badge, to call, just link the file to this script and include code: 
<div data-status="[approved / pending / cancelled]"></div>  */

function getStatusClass(status) {
    status = status.toLowerCase();

    if (status === "approved") 
        return "reservation-status-approved";
    if (status === "pending") 
        return "reservation-status-pending";
    if (status === "cancelled") 
        return "reservation-status-cancelled";

    return "";
}

function createStatusBadge(status) {
    return `<span class="reservation-status ${getStatusClass(status)}">${status}</span>`;
}


document.querySelectorAll("[data-status]").forEach(el => {
    const status = el.getAttribute("data-status");
    el.innerHTML = createStatusBadge(status);
});