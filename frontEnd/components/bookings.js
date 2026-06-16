document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.toggle("active", t === tab));
            panels.forEach(p => p.classList.toggle("active", p.id === target));
        });
    });

    // document.querySelectorAll(".history-booking-card").forEach(card => {
    //     card.addEventListener("click", () => {
    //         window.location.href = `booking-details.html?id=${card.dataset.bookingId}`;
    //     });
    // });
});