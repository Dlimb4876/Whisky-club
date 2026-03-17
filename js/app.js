// ── Navigation ────────────────────────────────────────────────────────────────

function showPage(name) {
  ['home', 'whisky-list', 'reviews'].forEach(function(p) {
    var page = document.getElementById('page-' + p);
    if (page) page.style.display = (p === name) ? '' : 'none';
    var btn = document.getElementById('nav-' + p);
    if (btn) btn.classList.toggle('active', p === name);
  });
  if (name === 'whisky-list') renderWhiskyList();
  if (name === 'reviews') renderReviews();
}

// ── Roll lock / unlock ────────────────────────────────────────────────────────

function updateRollLockUI() {
  var btn1 = document.getElementById('generateBtn1');
  var btn2 = document.getElementById('generateBtn2');
  var rollBtn = document.getElementById('rollNextSessionBtn');
  if (btn1) btn1.disabled = rollsLocked;
  if (btn2) btn2.disabled = rollsLocked;
  if (rollBtn) {
    rollBtn.textContent = rollsLocked ? '🎲 Roll Next Session' : '🔒 Lock Session';
    rollBtn.classList.toggle('locked', rollsLocked);
  }
}

function rollNextSession() {
  rollsLocked = !rollsLocked;
  saveSession();
  updateRollLockUI();
}

// ── Slot number selection ─────────────────────────────────────────────────────

function selectNumber(slot) {
  if (rollsLocked) return;

  // Build the pool of taken numbers (previously used + the other slot's current pick)
  var taken = usedNums.slice();
  var otherNum = (slot === 1) ? currentNum2 : currentNum1;
  if (otherNum !== null && !taken.includes(otherNum)) taken.push(otherNum);

  var available = Object.keys(entries).map(Number)
    .filter(function(n) { return !taken.includes(n); });

  if (available.length === 0) {
    alert('No more whiskies available to draw!');
    return;
  }

  var idx = Math.floor(Math.random() * available.length);
  var num = available[idx];

  if (slot === 1) currentNum1 = num;
  else currentNum2 = num;

  // Mark as used
  if (!usedNums.includes(num)) {
    usedNums.push(num);
    saveUsed();
    syncPush();
  }

  var entry = entries[num] || {};
  var whiskyName = entry.ed4 || entry.ed5 || '';

  // Update slot display
  document.getElementById('slotNum' + slot).textContent = '#' + num;
  document.getElementById('slotName' + slot).textContent = whiskyName;
  document.getElementById('slotRng' + slot).innerHTML =
    'Number <span>' + num + '</span> drawn from <span>' + available.length + '</span> available';

  // Show the result card
  var resultCard = document.getElementById('slotResult' + slot);
  resultCard.classList.add('visible');

  // Close review form if it was open for this slot
  if (activeSlot === slot) closeReviewForm();

  // Persist the new slot selections
  saveSession();

  // Fetch prices
  renderPriceTracker(num, slot);

  // Update whisky list tasted count in nav
  updateReviewNavBadge();
  renderWhiskyList();
}

// ── Restore last session ──────────────────────────────────────────────────────

function restoreSession() {
  var raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    var session = JSON.parse(raw);
    rollsLocked = session.locked !== false; // default to locked if not set

    [1, 2].forEach(function(slot) {
      var num = slot === 1 ? session.num1 : session.num2;
      if (num == null) return;

      if (slot === 1) currentNum1 = num;
      else currentNum2 = num;

      var entry = entries[num] || {};
      var whiskyName = entry.ed4 || entry.ed5 || '';

      document.getElementById('slotNum' + slot).textContent = '#' + num;
      document.getElementById('slotName' + slot).textContent = whiskyName;
      document.getElementById('slotRng' + slot).innerHTML =
        'Drawn last session — <span>' + num + '</span>';

      var resultCard = document.getElementById('slotResult' + slot);
      resultCard.classList.add('visible');

      renderPriceTracker(num, slot);
    });
  } catch (e) {
    // ignore corrupt data
  }
}

// ── Review form ───────────────────────────────────────────────────────────────

function openReviewForm(slot) {
  var num = (slot === 1) ? currentNum1 : currentNum2;
  if (num === null) return;

  activeSlot = slot;
  currentNum = num;

  var entry = entries[num] || {};
  var whiskyName = entry.ed4 || entry.ed5 || '';
  document.getElementById('reviewFormWhisky').textContent = whiskyName ? '— ' + whiskyName : '';

  resetRatings();
  buildPersonRatingRows();
  document.getElementById('reviewNotes').value = '';

  var form = document.getElementById('reviewForm');
  form.classList.add('visible');
  document.getElementById('reviewNotes').focus();
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeReviewForm() {
  document.getElementById('reviewForm').classList.remove('visible');
  activeSlot = null;
}

// ── Nav badge ─────────────────────────────────────────────────────────────────

function updateReviewNavBadge() {
  var badge = document.getElementById('reviewNavBadge');
  if (!badge) return;
  if (reviews.length > 0) {
    badge.textContent = reviews.length;
    badge.style.display = '';
  } else {
    badge.style.display = 'none';
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

resetRatings();
loadDefaultEntries();
renderWhiskyList();
renderReviews();
updateReviewNavBadge();
restoreSession();
updateRollLockUI();
syncPull();
showPage('home');
