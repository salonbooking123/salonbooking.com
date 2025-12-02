
// ------------------ GLOBAL: remove booking by id ------------------
function removeBookingById(bookingId) {
  if (!confirm("Remove this booking?")) return false;
  let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx === -1) return false;
  // remove and save
  bookings.splice(idx, 1);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  // Refresh known UI pieces (if functions exist)
  if (typeof loadBookings === 'function') try { loadBookings(); } catch(e) {}
  if (typeof loadSalonCards === 'function') try { loadSalonCards(); } catch(e) {}
  if (typeof renderOwnerSalon === 'function') try { renderOwnerSalon(); } catch(e) {}
  return true;
}


// -----------------------------
// SEARCH + DROPDOWN
// -----------------------------
function filterSalonSearch() {
    const box = document.getElementById("salonSearchBox");
    const list = document.getElementById("searchDropdown");

    const q = box.value.trim().toLowerCase();
    if (!q) {
        list.style.display = "none";
        return;
    }

    const salons = JSON.parse(localStorage.getItem("bs_salons_v1") || "[]");

    const matches = salons.filter(s =>
        s.name.toLowerCase().startsWith(q)
    );

    list.innerHTML = "";

    if (matches.length === 0) {
        list.style.display = "none";
        return;
    }

    matches.forEach(salon => {
        const li = document.createElement("li");
        li.textContent = salon.name;

        li.onclick = () => {
            // Save selected salon for customer page
            localStorage.setItem("selectedSalonFromHome", salon.id);

            // Redirect
            window.location.href = "customer.html";
        };

        list.appendChild(li);
    });

    list.style.display = "block";
}

// CLEAR BUTTON
document.getElementById("clearSearchBtn").onclick = function () {
    document.getElementById("salonSearchBox").value = "";
    document.getElementById("searchDropdown").style.display = "none";
};


// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ BOOK BUTTON LOGIC
function showBookButton(salonName) {
  const results = document.getElementById("salonSearchResults");

  results.innerHTML = `
    <div class="search-item"><strong>${salonName}</strong></div>
    <button class="book-btn" onclick="goToBooking('${salonName}')">Book Slot</button>
  `;

  results.style.display = "block";
}


// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ SEND SELECTED SALON TO BOOKING PAGE
function goToBooking(salonName) {
  localStorage.setItem("selectedSalonForBooking", salonName);
  location.href = "customer.html";
}
