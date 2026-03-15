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
    saveReviewsLocal();
    savePricesLocal();
    saveEntries();
    saveUsed();
    renderEntries();
    renderReviews();
    if (currentNum !== null) renderPriceTracker(currentNum);
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
      body: JSON.stringify({ reviews: reviews, prices: prices, entries: entries, usedNums: usedNums })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    setSyncStatus('ok', '✓ Synced');
  } catch (e) {
    setSyncStatus('err', '✗ Sync error');
  }
}
