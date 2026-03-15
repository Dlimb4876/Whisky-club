// ── Number selection ──────────────────────────────────────────────────────────

function selectNumber() {
  const available = Object.keys(entries).map(Number)
    .filter(function(n) { return !usedNums.includes(n); });
  if (available.length === 0) return;

  const idx = Math.floor(Math.random() * available.length);
  const num = available[idx];
  currentNum = num;

  if (!usedNums.includes(num)) {
    usedNums.push(num);
    saveUsed();
    syncPush();
  }

  const entry = entries[num];
  document.getElementById('resultNumber').textContent = '#' + num;
  document.getElementById('resultEditions').innerHTML =
    '<div class="result-edition"><span class="ed-name">' + escHtml(entry.ed4) + '</span></div>';
  document.getElementById('rngDisplay').innerHTML =
    'Number: <span>' + num + '</span> · drawn from <span>' + available.length + '</span> available';

  document.getElementById('resultCard').classList.add('visible');
  resetRatings();
  buildPersonRatingRows();
  document.getElementById('reviewNotes').value = '';
  document.getElementById('reviewForm').classList.remove('visible');
  renderPriceTracker(num);
  renderEntries();
  document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Init ──────────────────────────────────────────────────────────────────────

resetRatings();
loadDefaultEntries();
renderEntries();
renderReviews();
syncPull();
