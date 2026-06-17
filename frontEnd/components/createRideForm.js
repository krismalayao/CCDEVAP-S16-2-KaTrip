// This here is the create ride form which shows a massive input field for the driver to create a ride and edit details: call by
// adding <div data-create-ride-form></div> 

(function () {

  const locations = [
    "Mall of Asia",
    "Espana",
    "DLSU Taft",
    "National Museum",
    "EDSA LRT Station",
    "Quiapo Church",
  ];

  let passengers = 4;
  let pickups = [];

  let root;

  // Maps locations into an array for select menu
  function getLocationOptions(selected) {
    return locations.map(loc => 
      `<option value="${loc}" ${loc === selected ? "selected" : ""}>${loc}</option>`
    ).join("");
  }

  function renderPickups() {
    const pickupList = document.getElementById("create-ride-pickup-list");
    pickupList.innerHTML = "";

    pickups.forEach((pickup, index) => {
      const row = document.createElement("div");
      row.className = "create-ride-pickup-row";

      row.innerHTML = `
        <span class="create-ride-pickup-dot">●</span>
        <div class="create-ride-select-wrap">
          <select class="create-ride-select">${getLocationOptions(pickup)}</select>
        </div>
        <button class="create-ride-pickup-remove">✕</button>
        <span class="create-ride-pickup-handle">≡</span>
      `;

      // remove pickup (no window needed)
      row.querySelector(".create-ride-pickup-remove")
        .addEventListener("click", () => {
          pickups.splice(index, 1);
          renderPickups();
        });

      pickupList.appendChild(row);
    });
  }
 
  // Swapping pickup and destination inputs
  function swapLocations() {
    const from = document.getElementById("create-ride-from");
    const to   = document.getElementById("create-ride-to");
    const tmp  = from.value;
    from.value = to.value;
    to.value   = tmp;
  }

  function changePassengers(amount) {
    passengers = Math.max(1, passengers + amount);
    document.getElementById("create-ride-passenger-count").textContent = passengers;
  }

  function addPickup() {
    pickups.push("Espana");
    renderPickups();
  }

  function submitRide() {
    showToast("Ride successfully created");
  }

  /* Main Form Builder */

  function getFormHTML() {
    const today = new Date().toISOString().slice(0, 10);

    return `
      <div class="create-ride-wrap">

        <div class="create-ride-title">Where to?</div>

        <div class="create-ride-card">
          <div class="create-ride-route">
            <div class="create-ride-route-icons">
              <div class="create-ride-icon-circle"></div>
              <div class="create-ride-icon-dot"></div>
              <div class="create-ride-icon-dot"></div>
              <div class="create-ride-icon-dot"></div>
              <div class="create-ride-icon-dot"></div>
              <div class="create-ride-icon-dot"></div>
              <div class="create-ride-icon-circle-red"></div>
            </div>
            <div class="create-ride-route-fields">
              <div class="create-ride-select-wrap">
                <select id="create-ride-from" class="create-ride-select">${getLocationOptions("Mall of Asia")}</select>
              </div>
              <div class="create-ride-select-wrap">
                <select id="create-ride-to" class="create-ride-select">${getLocationOptions("DLSU Taft")}</select>
              </div>
            </div>

            <!-- swap button -->
            <button id="swap-btn" class="create-ride-swap-btn">⇅</button>
          </div>

          <div class="create-ride-est">
            <span>Est. Travel Time</span>
            <span>1 hr 30 min</span>
          </div>
        </div>

        <div class="create-ride-card">
          <div id="create-ride-pickup-list"></div>

          <!-- add pickup button -->
          <button id="add-pickup" class="create-ride-add-pickup-btn">
            <span class="create-ride-add-circle">+</span> Add Pickup Location
          </button>
        </div>

        <div class="create-ride-card">
          <div class="create-ride-grid-2" style="margin-bottom: 10px;">
            <div>
              <div class="create-ride-field-label">Date</div>
              <input id="create-ride-date" type="date" class="create-ride-input" value="${today}">
            </div>
            <div>
              <div class="create-ride-field-label">Departure Time</div>
              <input id="create-ride-time" type="time" class="create-ride-input" value="07:00">
            </div>
          </div>

          <div class="create-ride-grid-2">
            <div>
              <div class="create-ride-field-label">Recurrence</div>
              <div class="create-ride-select-wrap">
                <select id="create-ride-recurrence" class="create-ride-select">
                  <option value="does-not-repeat">Does not repeat</option>
                  <option value="repeat">Repeat</option>
                </select>
              </div>
            </div>

            <div>
              <div class="create-ride-field-label">No. of Passengers</div>
              <div class="create-ride-counter">
                <button id="minus" class="create-ride-counter-btn">−</button>
                <span id="create-ride-passenger-count" class="create-ride-counter-val">4</span>
                <button id="plus" class="create-ride-counter-btn">+</button>
              </div>
            </div>
          </div>
        </div>

        <div class="create-ride-fare-row">
          <span class="create-ride-fare-label">Total Fare Amount</span>
          <span class="create-ride-fare-amount">PHP 277.00</span>
        </div>

        <!-- submit button -->
        <button id="submit-btn" class="create-ride-submit-btn">Create Ride</button>

      </div>
    `;
  }

  /* Window popping up after successful ride creation */
  function showToast(message) {
    let toast = document.getElementById("create-ride-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "create-ride-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  /* binds the buttons to functions in script */
  function bindEvents() {
    root.querySelector("#swap-btn").addEventListener("click", swapLocations);
    root.querySelector("#add-pickup").addEventListener("click", addPickup);
    root.querySelector("#minus").addEventListener("click", () => changePassengers(-1));
    root.querySelector("#plus").addEventListener("click", () => changePassengers(1));
    root.querySelector("#submit-btn").addEventListener("click", submitRide);
  }

  /* Start up thing */
  function init() {
    root = document.querySelector("[data-create-ride-form]");
    root.innerHTML = getFormHTML();

    pickups = ["Espana", "National Museum"];
    renderPickups();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();