// ── Entries management ────────────────────────────────────────────────────────

function loadDefaultEntries() {
  if (Object.keys(entries).length > 0) return;
  WHISKY_LIST.forEach(function(name, i) {
    entries[i + 1] = { ed4: name, ed5: name };
  });
  saveEntries();
  renderEntries();
  syncPush();
}

function resetEntries() {
  if (!confirm('Reset all whiskies? This will restore all 100 entries and clear the used history.')) return;
  entries  = {};
  usedNums = [];
  currentNum = null;
  document.getElementById('resultCard').classList.remove('visible');
  WHISKY_LIST.forEach(function(name, i) {
    entries[i + 1] = { ed4: name, ed5: name };
  });
  saveEntries();
  saveUsed();
  renderEntries();
  syncPush();
}

function renderEntries() {
  const container = document.getElementById('entriesList');
  const badge     = document.getElementById('entryCountBadge');
  const btn       = document.getElementById('selectBtn');

  container.innerHTML = '';
  const nums      = Object.keys(entries).map(Number).sort(function(a, b) { return a - b; });
  const available = nums.filter(function(n) { return !usedNums.includes(n); });

  badge.textContent = nums.length + ' entr' + (nums.length === 1 ? 'y' : 'ies') +
    ' · ' + available.length + ' available';
  btn.disabled = available.length === 0;

  if (nums.length === 0) {
    container.innerHTML = '<p style="color:#5a3010;font-style:italic;font-size:0.9rem;">No entries loaded.</p>';
    return;
  }

  nums.forEach(function(n) {
    const e    = entries[n];
    const used = usedNums.includes(n);
    const item = document.createElement('div');
    item.className = 'entry-item' +
      (used ? ' used' : '') +
      (n === currentNum ? ' selected-entry' : '');
    item.innerHTML =
      '<span class="entry-num">#' + n + '</span>' +
      '<div class="entry-names">' +
        '<strong>' + escHtml(e.ed4) + '</strong>' +
      '</div>' +
      (used ? '<span class="used-badge">used</span>' : '');
    container.appendChild(item);
  });
}
