// ── Entries management ────────────────────────────────────────────────────────

function loadDefaultEntries() {
  if (Object.keys(entries).length > 0) return;
  WHISKY_LIST.forEach(function(name, i) {
    entries[i + 1] = { ed4: name, ed5: name };
  });
  saveEntries();
  renderWhiskyList();
  syncPush();
}

function resetEntries() {
  if (!confirm('Reset all whiskies? This will restore all entries and clear the used history.')) return;
  entries    = {};
  usedNums   = [];
  currentNum = null;
  currentNum1 = null;
  currentNum2 = null;
  WHISKY_LIST.forEach(function(name, i) {
    entries[i + 1] = { ed4: name, ed5: name };
  });
  saveEntries();
  saveUsed();
  renderWhiskyList();
  syncPush();
}

// ── Whisky List Page ──────────────────────────────────────────────────────────

function renderWhiskyList() {
  var container = document.getElementById('whiskyListContainer');
  if (!container) return;

  var badge = document.getElementById('whiskyListBadge');
  var searchEl = document.getElementById('whiskyListSearch');
  var search = searchEl ? searchEl.value.toLowerCase().trim() : '';

  var nums = Object.keys(entries).map(Number).sort(function(a, b) { return a - b; });
  var tastedCount = nums.filter(function(n) { return usedNums.includes(n); }).length;

  if (badge) badge.textContent = tastedCount + ' / ' + nums.length + ' tasted';

  var filtered = nums;
  if (search) {
    filtered = nums.filter(function(n) {
      var e = entries[n] || {};
      return String(n).includes(search) ||
        (e.ed4 || '').toLowerCase().includes(search) ||
        (e.ed5 || '').toLowerCase().includes(search);
    });
  }

  container.innerHTML = '';

  if (nums.length === 0) {
    container.innerHTML = '<p style="color:#5a3010;font-style:italic;font-size:0.9rem;">No entries loaded.</p>';
    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="no-reviews">No whiskies match your filter.</p>';
    return;
  }

  filtered.forEach(function(n) {
    var e = entries[n] || {};
    var isTasted = usedNums.includes(n);
    // Find if there's a review for this whisky number
    var review = reviews.find(function(r) { return r.number === n; });

    var item = document.createElement('div');
    item.className = 'whisky-list-item' + (isTasted ? ' tasted' : '');

    var reviewLink = '';
    if (review) {
      reviewLink = '<button class="btn-view-review" onclick="viewReview(' + n + ')">📝 View Review</button>';
    }

    item.innerHTML =
      '<span class="wl-num">#' + n + '</span>' +
      '<div class="wl-name">' + escHtml(e.ed4 || e.ed5 || '') + '</div>' +
      '<div class="wl-actions">' +
        reviewLink +
        '<button class="btn-tasted' + (isTasted ? ' is-tasted' : '') + '" onclick="toggleTasted(' + n + ')">' +
          (isTasted ? '✓ Tasted' : 'Mark Tasted') +
        '</button>' +
      '</div>';

    container.appendChild(item);
  });
}

function toggleTasted(num) {
  var idx = usedNums.indexOf(num);
  if (idx >= 0) {
    usedNums.splice(idx, 1);
  } else {
    usedNums.push(num);
  }
  saveUsed();
  renderWhiskyList();
  syncPush();
}

function viewReview(num) {
  showPage('reviews');
  var searchEl = document.getElementById('filterSearch');
  if (searchEl) {
    searchEl.value = String(num);
    renderReviews();
  }
  setTimeout(function() {
    var firstReview = document.querySelector('#reviewsList .review-entry');
    if (firstReview) firstReview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

// Legacy wrapper called by sync.js
function renderEntries() {
  renderWhiskyList();
}
