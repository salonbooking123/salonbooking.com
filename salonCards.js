// salonCards.js — loads salons from localStorage (bs_salons_v1)
document.addEventListener('DOMContentLoaded', loadSalonCards);

const SALON_TIMERS = {}; // keep interval ids per salon

function loadSalonCards(){
    const container = document.getElementById('salonCardsContainer');
    if(!container) return;

    const salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
    container.innerHTML = salons.length ? '' : '<p class="muted">No salons registered yet.</p>';

    salons.forEach(salon => {
        const card = document.createElement('div');
        card.className = 'salon-card';
        card.dataset.salon = salon.id;

        const cover = salon.images?.find(i=>i.category==='cover')?.data 
                   || salon.images?.[0]?.data 
                   || 'placeholder-cover.jpg';

        const logo = salon.images?.find(i=>i.category==='logo')?.data || cover;

        // compute waiting time & customers
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
                          .filter(b => b.salonId == salon.id);

        // total minutes waiting (sum timeRequired)
        const totalMinutes = bookings.reduce((sum, b) => sum + (Number(b.timeRequired) || 0), 0);
        const customersCount = bookings.length;

        // Convert minutes to HH:MM:SS remaining (start from totalMinutes*60)
        const remainingSeconds = Math.max(0, Math.floor(totalMinutes * 60));

        card.innerHTML = `
            <div class="salon-image">
                <img src="${cover}" alt="cover" style="width:100%;height:140px;object-fit:cover;border-radius:8px">
            </div>

            <div class="salon-card-body">
                <div class="salon-header" style="display:flex;gap:12px;align-items:center">
                    <img class="salon-logo" src="${logo}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
                    <div>
                      <h3 style="margin:0">${escapeHtml(salon.name)}</h3>
                      <div class="muted small">ID: ${salon.id}</div>
                    </div>
                </div>

                <p class="muted" style="margin-top:8px">
                  Waiting: <span class="waitTimeDisplay">${formatMinutes(totalMinutes)}</span>
                  &nbsp; | &nbsp;
                  Customers: <span class="custCount">${customersCount}</span>
                </p>

                <div style="margin-top:8px">
                    <a class="btn" href="customer.html?salon=${salon.id}">Book Slot</a>
                </div>
            </div>
        `;

        container.appendChild(card);

        // set timer per card (counts down seconds)
        startSalonCardTimer(salon.id, remainingSeconds);
    });
}

// helper format minutes to Hh Mm
function formatMinutes(mins) {
    mins = Number(mins) || 0;
    if (mins === 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return (h > 0 ? h + "h " : "") + m + "m";
}

function startSalonCardTimer(salonId, startSeconds) {
    // clear any existing timer first
    if (SALON_TIMERS[salonId]) {
        clearInterval(SALON_TIMERS[salonId]);
    }

    let remaining = startSeconds;

    // find the card node
    const card = document.querySelector(`.salon-card[data-salon="${salonId}"]`);
    if (!card) return;

    const waitEl = card.querySelector(".waitTimeDisplay");
    const custEl = card.querySelector(".custCount");

    // update once immediately
    updateDisplay();

    SALON_TIMERS[salonId] = setInterval(() => {
        // recompute bookings each minute (in case new bookings added/removed)
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]').filter(b => b.salonId == salonId);
        const totalMinutes = bookings.reduce((sum, b) => sum + (Number(b.timeRequired) || 0), 0);
        const newRemaining = Math.max(0, Math.floor(totalMinutes * 60));
        // sync if mismatch (someone added/removed)
        if (Math.abs(newRemaining - remaining) > 59) {
            remaining = newRemaining;
        } else {
            // normal decrement
            if (remaining > 0) remaining--;
        }
        // update UI
        updateDisplay();

        // if zero and no bookings - clear interval to save cycles
        if (remaining <= 0 && bookings.length === 0) {
            clearInterval(SALON_TIMERS[salonId]);
            delete SALON_TIMERS[salonId];
        }

    }, 1000);

    function updateDisplay() {
        // format remaining seconds as H:M:S or Xm
        if (!waitEl || !custEl) return;
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        if (h > 0) {
            waitEl.textContent = `${h}h ${m}m ${s}s`;
        } else if (m > 0) {
            waitEl.textContent = `${m}m ${s}s`;
        } else {
            waitEl.textContent = `${s}s`;
        }
        // customer count
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]').filter(b => b.salonId == salonId);
        custEl.textContent = bookings.length;
    }
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
