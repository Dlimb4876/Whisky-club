// ── Cloud sync (JSONBin) ──────────────────────────────────────────────────────

function setSyncStatus(state, text) {
  var el = document.getElementById('syncStatus');
  el.className   = 'sync-status ' + state;
  el.textContent = text;
}

async function syncPull() {
  setSyncStatus('busy', '⟳ Fetching…');
  try {
    const res  = await fetch(JSONBIN_BASE + '/b/' + JSONBIN_BIN + '/latest', {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    reviews  = Array.isArray(data.record.reviews)  ? data.record.reviews  : [];
    prices   = Array.isArray(data.record.prices)   ? data.record.prices   : [];
    if (data.record.entries  && typeof data.record.entries  === 'object') entries  = data.record.entries;
    if (Array.isArray(data.record.usedNums)) usedNums = data.record.usedNums;
    if (data.record.session  && typeof data.record.session  === 'object') {
      var s = data.record.session;
      currentNum1  = s.num1  != null ? s.num1  : currentNum1;
      currentNum2  = s.num2  != null ? s.num2  : currentNum2;
      rollsLocked  = s.locked === true;
      saveSession();
      restoreSession();
      updateRollLockUI();
    }
    saveReviewsLocal();
    savePricesLocal();
    saveEntries();
    saveUsed();
    renderEntries();
    renderReviews();
    if (currentNum1 !== null) renderPriceTracker(currentNum1, 1);
    if (currentNum2 !== null) renderPriceTracker(currentNum2, 2);
    setSyncStatus('ok', '✓ Synced');
  } catch (e) {
    setSyncStatus('err', '✗ Sync error');
  }
}

async function syncPush() {
  setSyncStatus('busy', '⟳ Saving…');
  try {
    const res = await fetch(JSONBIN_BASE + '/b/' + JSONBIN_BIN, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify({ reviews: reviews, prices: prices, entries: entries, usedNums: usedNums, session: { num1: currentNum1, num2: currentNum2, locked: rollsLocked } })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    setSyncStatus('ok', '✓ Synced');
  } catch (e) {
    setSyncStatus('err', '✗ Sync error');
  }
}
