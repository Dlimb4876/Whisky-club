// ── Entries management ────────────────────────────────────────────────────────

function addEntry() {
  const numInput = document.getElementById('entryNum');
  const ed4Input = document.getElementById('entryEd4');
  const ed5Input = document.getElementById('entryEd5');
  const num = parseInt(numInput.value, 10);
  const ed4 = ed4Input.value.trim();
  const ed5 = ed5Input.value.trim();

  if (isNaN(num) || num < 1 || num > 101) { flash(numInput); return; }
  if (!ed4) { flash(ed4Input); return; }
  if (!ed5) { flash(ed5Input); return; }

  entries[num] = { ed4: ed4, ed5: ed5 };
  numInput.value = '';
  ed4Input.value = '';
  ed5Input.value = '';
  saveEntries();
  renderEntries();
  syncPush();
}

function removeEntry(num) {
  if (currentNum === num) {
    currentNum = null;
    document.getElementById('resultCard').classList.remove('visible');
  }
  delete entries[num];
  usedNums = usedNums.filter(function(n) { return n !== num; });
  saveEntries();
  saveUsed();
  renderEntries();
  syncPush();
}

function clearEntries() {
  if (Object.keys(entries).length === 0) return;
  if (!confirm('Remove all whisky entries?')) return;
  entries  = {};
  usedNums = [];
  currentNum = null;
  document.getElementById('resultCard').classList.remove('visible');
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
    container.innerHTML = '<p style="color:#5a3010;font-style:italic;font-size:0.9rem;">No entries added yet.</p>';
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
        '<div class="entry-ed"><span style="color:#8b5030">4th:</span> <strong>' + escHtml(e.ed4) + '</strong></div>' +
        '<div class="entry-ed"><span style="color:#8b5030">5th:</span> <strong>' + escHtml(e.ed5) + '</strong></div>' +
      '</div>' +
      (used ? '<span class="used-badge">used</span>' : '') +
      '<button class="btn-remove" onclick="removeEntry(' + n + ')">Remove</button>';
    container.appendChild(item);
  });
}
