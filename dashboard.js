// -------------------- CHECK ADMIN LOGIN --------------------
if (localStorage.getItem("adminLogged") !== "YES") {
    location.href = "admin-login.html";
}

// ======================================================
// 1) OWNERS — WITH REMOVE BUTTON
// ======================================================
function loadOwners() {
    const owners = JSON.parse(localStorage.getItem("owners") || "[]");

    if (owners.length === 0) {
        document.getElementById("ownersTable").innerHTML =
            "<p>No owners added yet.</p>";
        return;
    }

    let html = `<table class="custom-table">
        <tr>
            <th>S.No.</th>
            <th>Owner Name</th>
            <th>Email ID</th>
            <th>Phone No.</th>
            <th>Action</th>  <!-- ⭐ NEW -->
        </tr>
    `;

    owners.forEach((o, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${o.name}</td>
                <td>${o.email}</td>
                <td>${o.phone}</td>
                <td>
                    <button class="btn small danger" onclick="removeOwner(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    html += "</table>";
    document.getElementById("ownersTable").innerHTML = html;
}

// ⭐ NEW — remove individual owner
function removeOwner(index) {
    if (!confirm("Remove this owner?")) return;

    let owners = JSON.parse(localStorage.getItem("owners") || "[]");
    owners.splice(index, 1);

    localStorage.setItem("owners", JSON.stringify(owners));
    loadOwners();
}



// ======================================================
// 2) SALONS — WITH REMOVE BUTTON
// ======================================================
function loadSalons() {
    const salons = JSON.parse(localStorage.getItem("bs_salons_v1") || "[]");

    if (salons.length === 0) {
        document.getElementById("salonsTable").innerHTML =
            "<p>No salons added yet.</p>";
        return;
    }

    let html = `<table class="custom-table">
        <tr>
            <th>S.No.</th>
            <th>Salon Name</th>
            <th>Owner ID</th>
            <th>Action</th>  <!-- ⭐ NEW -->
        </tr>
    `;

    salons.forEach((s, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${s.name}</td>
                <td>${s.ownerId}</td>
                <td>
                    <button class="btn small danger" onclick="removeSalon(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    html += "</table>";
    document.getElementById("salonsTable").innerHTML = html;
}

// ⭐ NEW — remove single salon
function removeSalon(index) {
    if (!confirm("Remove this salon?")) return;

    let salons = JSON.parse(localStorage.getItem("bs_salons_v1") || "[]");
    salons.splice(index, 1);

    localStorage.setItem("bs_salons_v1", JSON.stringify(salons));
    loadSalons();
}



// ======================================================
// 3) BOOKINGS — Already correct (kept same)
// ======================================================
function loadBookings() {

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    let salons = JSON.parse(localStorage.getItem("bs_salons_v1")) || [];

    if (bookings.length === 0) {
        document.getElementById("bookingsTable").innerHTML =
            "<p>No customer bookings yet.</p>";
        return;
    }

    let html = `
        <table class="custom-table">
            <tr>
                <th>S.No.</th>
                <th>Customer Name</th>
                <th>Phone No.</th>
                <th>Salon & ID</th>
                <th>Services</th>
                <th>Date & Time</th>
                <th>Action</th>
            </tr>
    `;

    bookings.forEach((b, index) => {

        let salon = salons.find(s => s.id == b.salonId);
        let salonDisplay = salon ? `${salon.name} (ID: ${salon.id})` : "Unknown Salon";

        let servicesList = Array.isArray(b.services)
            ? b.services.join(", ")
            : b.service || "N/A";

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${b.name}</td>
                <td>${b.phone || "N/A"}</td>
                <td>${salonDisplay}</td>
                <td>${servicesList}</td>
                <td>${b.date || "N/A"}</td>
                <td>
                    <button class="btn small danger" onclick="removeBooking(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</table>`;
    document.getElementById("bookingsTable").innerHTML = html;
}

function removeBooking(index) {
    if (!confirm("Are you sure to remove this booking?")) return;

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.splice(index, 1);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    loadBookings();
}



// ======================================================
// 4) SERVICES — WITH REMOVE BUTTON
// ======================================================
function loadServices() {
    const services = JSON.parse(localStorage.getItem("services") || "[]");

    if (services.length === 0) {
        document.getElementById("servicesList").innerHTML =
            "<p>No services added yet.</p>";
        return;
    }

    let html = `<table class="custom-table">
        <tr>
            <th>S.No.</th>
            <th>Service</th>
            <th>Price</th>
            <th>Duration</th>
            <th>Action</th> <!-- ⭐ NEW -->
        </tr>
    `;

    services.forEach((s, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${s.name}</td>
                <td>₹${s.price}</td>
                <td>₹${s.duration}</td>
                <td>
                    <button class="btn small danger" onclick="removeService(${index})">Remove</button>
                </td>
            </tr>
        `;
    });

    html += "</table>";
    document.getElementById("servicesList").innerHTML = html;
}

// ⭐ NEW — remove 1 service
function removeService(index) {
    if (!confirm("Delete this service?")) return;

    let services = JSON.parse(localStorage.getItem("services") || "[]");
    services.splice(index, 1);

    localStorage.setItem("services", JSON.stringify(services));
    loadServices();
}



// ======================================================
// ADD NEW SERVICE (unchanged)
// ======================================================
document.getElementById("addServiceBtn").onclick = () => {
    const name = document.getElementById("serviceName").value.trim();
    const price = document.getElementById("servicePrice").value.trim();
    const duration = document.getElementById("serviceDuration").value.trim();  // ⚠️ FIX

    if (!name || !price || !duration) return;

    let services = JSON.parse(localStorage.getItem("services") || "[]");

    services.push({
        name,
        price,
        duration   // ⚠️ FIX
    });

    localStorage.setItem("services", JSON.stringify(services));
    loadServices();
};



// ======================================================
// DELETE ALL BUTTONS (unchanged)
// ======================================================
document.getElementById("deleteAllSalonsBtn").onclick = () => {
    if (confirm("Delete ALL salons?")) {
        localStorage.removeItem("bs_salons_v1");
        loadSalons();
    }
};

document.getElementById("resetDBBtn").onclick = () => {
    if (confirm("RESET ENTIRE DATABASE?")) {
        localStorage.clear();
        alert("Database cleared!");
        location.reload();
    }
};



// ======================================================
// INITIAL LOAD
// ======================================================
loadOwners();
loadSalons();
loadBookings();
loadServices();
