// ── Review form ───────────────────────────────────────────────────────────────

function toggleReviewForm() {
  const form = document.getElementById('reviewForm');
  form.classList.toggle('visible');
  if (form.classList.contains('visible')) {
    buildPersonRatingRows();
    document.getElementById('reviewNotes').focus();
  }
}

async function saveReview() {
  if (currentNum === null) return;
  const notes = document.getElementById('reviewNotes').value.trim();
  const vals  = PERSONS.map(function(p) { return currentRatings[p.toLowerCase()]; });
  const hasRating = vals.some(function(v) { return v > 0; });

  if (!hasRating && !notes) {
    flash(document.getElementById('reviewNotes'));
    return;
  }

  const entry = entries[currentNum] || { ed4: '', ed5: '' };
  const now   = new Date();
  const date  = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  var ratings = {};
  PERSONS.forEach(function(p) { ratings[p.toLowerCase()] = currentRatings[p.toLowerCase()]; });

  const avg = calcAvg(ratings);

  reviews.push({
    number:    currentNum,
    ed4:       entry.ed4,
    ed5:       entry.ed5,
    ratings:   ratings,
    ratingAvg: parseFloat(avg.toFixed(2)),
    notes:     notes,
    date:      date,
    timestamp: now.getTime()
  });

  saveReviewsLocal();
  renderReviews();
  document.getElementById('reviewForm').classList.remove('visible');
  await syncPush();
  document.getElementById('reviewsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function deleteReview(index) {
  if (!confirm('Delete this tasting note?')) return;
  reviews.splice(index, 1);
  saveReviewsLocal();
  renderReviews();
  syncPush();
}

function clearReviews() {
  if (reviews.length === 0) return;
  if (!confirm('Delete all tasting notes? This will also clear them from the cloud.')) return;
  reviews = [];
  saveReviewsLocal();
  renderReviews();
  syncPush();
}

// ── Reviews render ────────────────────────────────────────────────────────────

function renderReviews() {
  const container = document.getElementById('reviewsList');
  const section   = document.getElementById('reviewsSection');
  const badge     = document.getElementById('reviewCountBadge');

  badge.textContent = reviews.length;

  if (reviews.length === 0) {
    section.classList.remove('visible');
    return;
  }

  section.classList.add('visible');

  const search    = (document.getElementById('filterSearch').value || '').toLowerCase().trim();
  const sortOrder = document.getElementById('sortOrder').value || 'date-desc';

  var items = reviews.map(function(r, i) { return { r: r, i: i }; });

  if (search) {
    items = items.filter(function(item) {
      var r = item.r;
      return String(r.number || '').includes(search) ||
        (r.ed4   || '').toLowerCase().includes(search) ||
        (r.ed5   || '').toLowerCase().includes(search) ||
        (r.whisky|| '').toLowerCase().includes(search) ||
        (r.notes || '').toLowerCase().includes(search);
    });
  }

  items.sort(function(a, b) {
    var ra = a.r, rb = b.r;
    switch (sortOrder) {
      case 'date-asc':    return (ra.timestamp || 0) - (rb.timestamp || 0);
      case 'date-desc':   return (rb.timestamp || 0) - (ra.timestamp || 0);
      case 'num-asc':     return (ra.number    || 0) - (rb.number    || 0);
      case 'num-desc':    return (rb.number    || 0) - (ra.number    || 0);
      case 'rating-asc':  return (ra.ratingAvg || 0) - (rb.ratingAvg || 0);
      case 'rating-desc': return (rb.ratingAvg || 0) - (ra.ratingAvg || 0);
      default:            return (rb.timestamp || 0) - (ra.timestamp || 0);
    }
  });

  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p class="no-reviews">No reviews match your filter.</p>';
    return;
  }

  items.forEach(function(item) {
    var r       = item.r;
    var realIdx = item.i;
    var entry   = document.createElement('div');
    entry.className = 'review-entry';

    // Per-person ratings
    var personHtml = '';
    if (r.ratings) {
      PERSONS.forEach(function(p) {
        var val = r.ratings[p.toLowerCase()] || 0;
        if (val > 0) {
          personHtml +=
            '<div class="review-person-row">' +
              '<span class="review-person-name">' + p + ':</span>' +
              '<span class="review-person-stars">' + starsHtml(val) + '</span>' +
            '</div>';
        }
      });
    } else if (r.rating) {
      // Legacy single-rating fallback
      personHtml = '<div class="review-stars">' + starsHtml(r.rating) + '</div>';
    }

    // Average line
    var avgHtml = '';
    if (r.ratingAvg) {
      avgHtml =
        '<div class="review-avg-line">' +
          '<span class="review-avg-label">Avg:</span>' +
          '<span class="review-avg-stars">' + starsHtml(r.ratingAvg) + '</span>' +
          '<span class="review-avg-val">(' + r.ratingAvg.toFixed(1) + ')</span>' +
        '</div>';
    }

    // Edition / whisky name line
    var edHtml = '';
    if (r.ed4 || r.ed5) {
      edHtml = '<div class="review-edition-names">';
      if (r.ed4 === r.ed5 || !r.ed5) {
        var displayName = r.ed4 || r.ed5;
        edHtml += '<div class="review-ed-line"><strong>' + escHtml(displayName) + '</strong></div>';
      } else {
        edHtml +=
          (r.ed4 ? '<div class="review-ed-line"><span style="color:#8b5030">4th:</span> <strong>' + escHtml(r.ed4) + '</strong></div>' : '') +
          (r.ed5 ? '<div class="review-ed-line"><span style="color:#8b5030">5th:</span> <strong>' + escHtml(r.ed5) + '</strong></div>' : '');
      }
      edHtml += '</div>';
    }

    // Header title (number badge + optional legacy whisky name)
    var titleHtml = (r.number !== undefined)
      ? '<span class="review-num-badge">#' + r.number + '</span>'
      : '';
    if (r.whisky && !r.ed4) {
      titleHtml += '<span class="review-whisky-name">' + escHtml(r.whisky) + '</span>';
    }

    entry.innerHTML =
      '<div class="review-entry-header">' +
        '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:0.3rem;">' + titleHtml + '</div>' +
        '<div class="review-meta"><span class="review-date">' + escHtml(r.date || '') + '</span></div>' +
      '</div>' +
      edHtml +
      (personHtml ? '<div class="review-person-ratings">' + personHtml + '</div>' : '') +
      avgHtml +
      (r.notes ? '<div class="review-notes">' + escHtml(r.notes) + '</div>' : '') +
      '<div class="review-entry-actions">' +
        '<button class="btn-delete-review" onclick="deleteReview(' + realIdx + ')">✕ Delete</button>' +
      '</div>';

    container.appendChild(entry);
  });
}
