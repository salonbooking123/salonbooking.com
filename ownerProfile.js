// ownerProfile.js
document.addEventListener('DOMContentLoaded', () => {
  const loggedId = localStorage.getItem('loggedOwner');
  if (!loggedId) return location.href = 'signin.html';

  // safe element getters
  const pfNameEl = document.getElementById('pf_name');
  const pfEmailEl = document.getElementById('pf_email');
  const pfPassEl = document.getElementById('pf_pass');
  const pfPass2El = document.getElementById('pf_pass2');
  const pfMsgEl = document.getElementById('pf_msg');
  const logoPreviewEl = document.getElementById('logoPreview');
  const coverPreviewEl = document.getElementById('coverPreview');
  const galleryPreviewEl = document.getElementById('galleryPreview');

  // load owners and current owner
  const owners = JSON.parse(localStorage.getItem('owners') || '[]');
  const me = owners.find(o => o.id == loggedId);
  if (!me) return location.href = 'signin.html';

  // populate profile fields (if inputs exist)
  if (pfNameEl) pfNameEl.value = me.name || '';
  if (pfEmailEl) pfEmailEl.value = me.email || '';

  // ---------- SALON RECORD HANDLING ----------
  // Ensure salons list exists and get this owner's salon (or create a default one)
  let salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
  let mySalon = salons.find(s => s.ownerId == loggedId);

  if (!mySalon) {
    mySalon = {
      id: 'salon_' + Date.now(),
      ownerId: loggedId,
      name: (me.name || 'Owner') + "'s Salon",
      tag: 'Your tag',
      images: [],    // { category: 'logo'|'cover'|'gallery', data: dataUrl }
      // queue will be derived from bookings (keeps single source of truth)
      currentTimeLeft: 0 // seconds
    };
    salons.push(mySalon);
    localStorage.setItem('bs_salons_v1', JSON.stringify(salons));
  }

  // helper: escape
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // --------- RENDER SALON (owner view) ----------
  function renderOwnerSalon() {
    const box = document.getElementById('ownerSalonBox');
    if (!box) return;

    // refresh local copy of salons/mySalon
    salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
    mySalon = salons.find(s => s.ownerId == loggedId) || mySalon;

    const coverImg = mySalon.images?.find(im => im.category === 'cover')?.data;
    const logoImg = mySalon.images?.find(im => im.category === 'logo')?.data;
    const galleryImgs = mySalon.images?.filter(im => im.category === 'gallery') || [];

    box.innerHTML = `
      <div style="margin-bottom:12px;">
        ${ coverImg ? `<img src="${coverImg}" class="cover-preview" alt="cover">` : '<div style="height:140px;background:#f1f1f1;border-radius:8px;display:flex;align-items:center;justify-content:center">No cover</div>' }
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        ${ logoImg ? `<img src="${logoImg}" style="width:100px;height:100px;object-fit:cover;border-radius:8px">` : `<div style="width:100px;height:100px;background:#f7f7f7;border-radius:8px;display:flex;align-items:center;justify-content:center">Logo</div>` }
        <div>
          <h3 style="margin:0 0 6px">${escapeHtml(mySalon.name)}</h3>
          <div class="muted small">Salon ID: ${mySalon.id}</div>
          <div id="ownerQueueSummary" class="muted small" style="margin-top:6px;"></div>
        </div>
      </div>
      <div>
        <strong>Gallery:</strong>
        <div class="gallery-grid" id="ownerGalleryBox"></div>
      </div>
    `;

    // populate gallery previews
    const galleryBox = document.getElementById('ownerGalleryBox');
    galleryBox.innerHTML = '';
    galleryImgs.forEach(g => {
      const img = document.createElement('img');
      img.src = g.data;
      galleryBox.appendChild(img);
    });

    // update small previews on the form if present
    if (logoPreviewEl) logoPreviewEl.innerHTML = logoImg ? `<img src="${logoImg}" style="width:100px;height:100px;object-fit:cover;border-radius:8px">` : '';
    if (coverPreviewEl) {
      if (coverImg) { coverPreviewEl.src = coverImg; coverPreviewEl.style.display = 'block'; } 
      else { coverPreviewEl.style.display = 'none'; }
    }
    if (galleryPreviewEl) {
      galleryPreviewEl.innerHTML = '';
      galleryImgs.forEach(g => {
        const img = document.createElement('img');
        img.src = g.data;
        galleryPreviewEl.appendChild(img);
      });
    }

    // update queue summary (count + timer)
    updateOwnerQueueSummary();
  }

  // --------- BOOKINGS / QUEUE logic ----------
  // Bookings are stored in localStorage 'bookings' array. We derive salon queue from bookings.
  function getMyBookings() {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]');
    // consider bookings in chronological order (push adds at end)
    return all.filter(b => b.salonId === mySalon.id);
  }

  function computeCurrentTimeLeftSeconds(bookingsArr) {
    // bookingsArr items should have timeRequired in minutes (best practice). Fallback 30 min.
    return bookingsArr.reduce((sum, b) => {
      const mins = Number(b.timeRequired) || Number(b.timeRequiredMinutes) || 30;
      return sum + Math.round(mins * 60);
    }, 0);
  }

  // Build mySalon.queue from bookings (queue items: { id, name, phone, services, date, time, timeRequired })
  function updateSalonQueueFromBookings() {
    const myBookings = getMyBookings();
    mySalon.queue = myBookings.map(b => ({
      id: b.id,
      name: b.name,
      phone: b.phone || 'N/A',
      services: Array.isArray(b.services) ? b.services : (b.service ? [b.service] : []),
      date: b.date,
      time: b.time,
      timeRequiredMinutes: Number(b.timeRequired) || Number(b.timeRequiredMinutes) || 30
    }));
    mySalon.currentTimeLeft = computeCurrentTimeLeftSeconds(myBookings);
    // persist to salons storage for other tabs
    salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
    const idx = salons.findIndex(s => s.id == mySalon.id);
    if (idx !== -1) {
      salons[idx].queue = mySalon.queue;
      salons[idx].currentTimeLeft = mySalon.currentTimeLeft;
      localStorage.setItem('bs_salons_v1', JSON.stringify(salons));
    }
  }

  // render queue (owner page)
  function renderQueue() {
    const box = document.getElementById('queueBox');
    if (!box) return;

    updateSalonQueueFromBookings(); // refresh mySalon.queue

    if (!mySalon.queue || mySalon.queue.length === 0) {
      box.innerHTML = "<p>No customers in queue.</p>";
      updateOwnerQueueSummary();
      return;
    }

    let html = "";
    mySalon.queue.forEach((c, idx) => {
      html += `
        <div class="queue-item" style="border:1px solid #ddd;padding:10px;margin:6px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div><b>${escapeHtml(c.name)}</b> (${escapeHtml(c.phone || 'N/A')})</div>
            <div class="muted small">Services: ${escapeHtml(c.services.join(', '))}</div>
            <div class="muted small">Date: ${escapeHtml(c.date || '')} • Time: ${escapeHtml(c.time || '')}</div>
            <div class="muted small">Duration: ${escapeHtml(String(c.timeRequiredMinutes))} min</div>
          </div>
          <div style="margin-left:12px;">
            <button class="btn small danger" onclick="ownerRemoveBookingByIndex(${idx})">Remove</button>
          </div>
        </div>
      `;
    });

    box.innerHTML = html;
    updateOwnerQueueSummary();
  }

  // summary on owner card: count + countdown display
  function formatTimeLeft(seconds) {
    if (!seconds || seconds <= 0) return "0m 0s";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  }

  function updateOwnerQueueSummary() {
    const sumEl = document.getElementById('ownerQueueSummary');
    if (!sumEl) return;
    const count = (mySalon.queue && mySalon.queue.length) || 0;
    sumEl.innerText = `Waiting: ${count} customer(s) • ETA: ${formatTimeLeft(mySalon.currentTimeLeft)}`;
  }

  // remove booking by index (owner view). This removes from bookings storage (single source)
  window.ownerRemoveBookingByIndex = function(indexInQueue) {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const myBookings = allBookings.filter(b => b.salonId === mySalon.id);

    const target = myBookings[indexInQueue];
    if (!target) return;

    if (!confirm(`Remove booking of ${target.name}? This will delete the booking permanently.`)) return;

    const newAll = allBookings.filter(b => b.id !== target.id);
    localStorage.setItem('bookings', JSON.stringify(newAll));

    // after removal recompute salon queue/time and UI
    updateSalonQueueFromBookings();
    renderQueue();
    renderBookings(); // in case bookings panel is separate
    renderOwnerSalon();

    // update index cards if loaded
    if (typeof loadSalonCards === 'function') {
      try { loadSalonCards(); } catch (e) {}
    }
  };

  // optional global helper used by other modules to remove booking by booking id
  window.removeBookingById = function(bookingId) {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]');
    const newAll = all.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(newAll));
    updateSalonQueueFromBookings();
    renderQueue();
    renderBookings();
    renderOwnerSalon();
  };

  // render bookings list (same as queue but derived from bookings)
  function renderBookings() {
    const box = document.getElementById("queueBox");
    if (!box) return;

    const myBookings = getMyBookings();

    if (myBookings.length === 0) {
      box.innerHTML = "<p>No bookings yet.</p>";
      updateOwnerQueueSummary();
      return;
    }

    let html = "";
    myBookings.forEach((bk, index) => {
      const servicesText = Array.isArray(bk.services) ? bk.services.join(", ") : (bk.service || "N/A");
      html += `
        <div class="queue-item" style="border:1px solid #ddd;padding:10px;margin:6px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div><b>${escapeHtml(bk.name)}</b> (${escapeHtml(bk.phone || "N/A")})</div>
            <div class="muted small">Services: ${escapeHtml(servicesText)}</div>
            <div class="muted small">Date: ${escapeHtml(bk.date || '')} • Time: ${escapeHtml(bk.time || '')}</div>
            <div class="muted small">Duration: ${escapeHtml(String(bk.timeRequired || bk.timeRequiredMinutes || 30))} min</div>
          </div>
          <div style="margin-left:12px;">
            <button class="btn small danger" onclick="ownerRemoveBookingById('${bk.id}')">Remove</button>
          </div>
        </div>
      `;
    });

    box.innerHTML = html;
    updateOwnerQueueSummary();
  }

  // version that removes by booking id (called by renderBookings buttons)
  window.ownerRemoveBookingById = function(bookingId) {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const target = allBookings.find(b => b.id === bookingId);
    if (!target) return;
    if (!confirm(`Remove booking of ${target.name}?`)) return;

    const newAll = allBookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(newAll));

    updateSalonQueueFromBookings();
    renderQueue();
    renderBookings();
    renderOwnerSalon();
    if (typeof loadSalonCards === 'function') try { loadSalonCards(); } catch(e){}
  };

  // ---------- COUNTDOWN TIMER (updates every second) ----------
  // stored in salons as currentTimeLeft in seconds
  setInterval(() => {
    // refresh salons & mySalon
    salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
    const idx = salons.findIndex(s => s.id == mySalon.id);
    if (idx === -1) return;

    if (salons[idx].currentTimeLeft > 0) {
      salons[idx].currentTimeLeft = Math.max(0, salons[idx].currentTimeLeft - 1);
      localStorage.setItem('bs_salons_v1', JSON.stringify(salons));
      mySalon = salons[idx];
      updateOwnerQueueSummary();
    }

    // try refresh index cards if present
    if (typeof loadSalonCards === 'function') {
      try { loadSalonCards(); } catch (e) {}
    }
  }, 1000);

  // ---------- CROPPER + IMAGE UPLOAD HANDLING ----------
  // re-use your existing Cropper.js flow but kept local and tidy
  let cropper = null;
  const cropperModal = document.getElementById('cropperModal');
  const cropperImage = document.getElementById('cropperImage');
  let currentUploadCategory = null; // 'logo'|'cover'|'gallery'
  let currentFileQueueForGallery = [];

  function openCropper(file, opts = {}) {
    const reader = new FileReader();
    reader.onload = () => {
      if (!cropperImage) return;
      cropperImage.src = reader.result;
      if (cropperModal) cropperModal.style.display = 'flex';

      if (cropper) { cropper.destroy(); cropper = null; }

      cropper = new Cropper(cropperImage, {
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        zoomable: true,
        scalable: false,
        aspectRatio: opts.aspectRatio || NaN,
        responsive: true
      });
    };
    reader.readAsDataURL(file);
  }

  if (document.getElementById('cropCancel')) {
    document.getElementById('cropCancel').onclick = () => {
      if (cropper) { cropper.destroy(); cropper = null; }
      if (cropperModal) cropperModal.style.display = 'none';
      currentUploadCategory = null;
      currentFileQueueForGallery = [];
    };
  }

  if (document.getElementById('cropSave')) {
    document.getElementById('cropSave').onclick = () => {
      if (!cropper) return;
      const canvas = cropper.getCroppedCanvas({ width: 1200, height: 1200, imageSmoothingQuality: 'high' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      saveImageToSalon(currentUploadCategory, dataUrl);

      cropper.destroy(); cropper = null;
      if (cropperModal) cropperModal.style.display = 'none';

      if (currentUploadCategory === 'gallery' && currentFileQueueForGallery.length) {
        const next = currentFileQueueForGallery.shift();
        setTimeout(() => openCropper(next, { aspectRatio: NaN }), 250);
      } else {
        currentUploadCategory = null;
        currentFileQueueForGallery = [];
      }
    };
  }

  function saveImageToSalon(category, dataUrl) {
    salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
    const idx = salons.findIndex(s => s.id == mySalon.id);
    if (idx === -1) {
      salons.push(mySalon);
    }

    salons[idx] = salons[idx] || mySalon;
    salons[idx].images = salons[idx].images || [];

    if (category === 'logo') {
      salons[idx].images = salons[idx].images.filter(i => i.category !== 'logo');
      salons[idx].images.push({ category: 'logo', data: dataUrl });
    } else if (category === 'cover') {
      salons[idx].images = salons[idx].images.filter(i => i.category !== 'cover');
      salons[idx].images.push({ category: 'cover', data: dataUrl });
    } else if (category === 'gallery') {
      salons[idx].images.push({ category: 'gallery', data: dataUrl });
    }

    localStorage.setItem('bs_salons_v1', JSON.stringify(salons));
    mySalon = salons.find(s => s.ownerId == loggedId);

    // Re-render owner preview & index cards (if present)
    renderOwnerSalon();
    renderQueue();
    if (typeof loadSalonCards === 'function') {
      try { loadSalonCards(); } catch (e) {}
    }
  }

  // file input listeners (if present)
  const logoFileInput = document.getElementById('pf_logo_file');
  if (logoFileInput) {
    logoFileInput.addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      currentUploadCategory = 'logo';
      openCropper(file, { aspectRatio: 1 });
    });
  }

  const coverFileInput = document.getElementById('pf_cover_file');
  if (coverFileInput) {
    coverFileInput.addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      currentUploadCategory = 'cover';
      openCropper(file, { aspectRatio: 16 / 6 });
    });
  }

  const galleryFileInput = document.getElementById('pf_gallery_file');
  if (galleryFileInput) {
    galleryFileInput.addEventListener('change', (ev) => {
      const files = Array.from(ev.target.files || []);
      if (!files.length) return;
      currentUploadCategory = 'gallery';
      currentFileQueueForGallery = files.slice(1);
      openCropper(files[0], { aspectRatio: NaN });
    });
  }

  // ---------- PROFILE SAVE (name/email/password/phone) ----------
  const profileForm = document.getElementById('ownerProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (pfNameEl && pfNameEl.value.trim()) || me.name;
      const email = (pfEmailEl && pfEmailEl.value.trim()) || me.email;
      const phoneEl = document.getElementById('pf_phone');
      const phone = phoneEl ? phoneEl.value.trim() : (me.phone || '');

      const pass = (pfPassEl && pfPassEl.value.trim()) || '';
      const pass2 = (pfPass2El && pfPass2El.value.trim()) || '';

      if ((pass || pass2) && pass !== pass2) {
        if (pfMsgEl) pfMsgEl.innerText = 'Passwords do not match';
        return;
      }

      // update owners list
      let ownersList = JSON.parse(localStorage.getItem('owners') || '[]');
      const idx = ownersList.findIndex(o => o.id == loggedId);
      if (idx !== -1) {
        ownersList[idx].name = name;
        ownersList[idx].email = email;
        if (phone) ownersList[idx].phone = phone;
        if (pass) ownersList[idx].pass = pass;
        localStorage.setItem('owners', JSON.stringify(ownersList));
      }

      // update salon name
      salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
      salons.forEach(s => {
        if (s.ownerId == loggedId) s.name = name + "'s Salon";
      });
      localStorage.setItem('bs_salons_v1', JSON.stringify(salons));

      if (pfMsgEl) pfMsgEl.innerText = 'Profile saved';

      // refresh local copies and UI
      salons = JSON.parse(localStorage.getItem('bs_salons_v1') || '[]');
      mySalon = salons.find(s => s.ownerId == loggedId) || mySalon;
      renderOwnerSalon();
      renderQueue();
      renderBookings();
      if (typeof loadSalonCards === 'function') {
        try { loadSalonCards(); } catch(e) {}
      }
    });
  }

  // --------- API helpers for other pages (optional) ----------
  // add booking to bookings + update queue
  window.addCustomerBooking = function(bookingObj) {
    // bookingObj must include: id (optional), name, phone, salonId, services (array), date, time, timeRequired (minutes)
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const b = Object.assign({
      id: bookingObj.id || ('bk_' + Date.now()),
      name: bookingObj.name || 'Customer',
      phone: bookingObj.phone || 'N/A',
      salonId: bookingObj.salonId,
      services: bookingObj.services || [],
      date: bookingObj.date || new Date().toLocaleDateString(),
      time: bookingObj.time || new Date().toLocaleTimeString(),
      timeRequired: Number(bookingObj.timeRequired) || 30
    }, {});
    allBookings.push(b);
    localStorage.setItem('bookings', JSON.stringify(allBookings));

    // update queue for affected salon
    if (b.salonId === mySalon.id) {
      updateSalonQueueFromBookings();
      renderQueue();
      renderBookings();
      renderOwnerSalon();
    }
    if (typeof loadSalonCards === 'function') try { loadSalonCards(); } catch(e) {}
  };

  // initialize UI on load
  updateSalonQueueFromBookings();
  renderOwnerSalon();
  renderQueue();
  renderBookings();

});
