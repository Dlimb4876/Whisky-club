// ── Helper utilities ──────────────────────────────────────────────────────────

function flash(el) {
  el.style.borderColor = '#8b2500';
  setTimeout(function() { el.style.borderColor = ''; }, 1000);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Returns the average of all non-zero values in ratingsObj, or 0 if none. */
function calcAvg(ratingsObj) {
  var vals = PERSONS
    .map(function(p) { return ratingsObj[p.toLowerCase()] || 0; })
    .filter(function(v) { return v > 0; });
  if (vals.length === 0) return 0;
  return vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
}

/** Returns a 5-star HTML string for a numeric average (0–5). */
function starsHtml(avg) {
  var round = Math.round(avg);
  return '★'.repeat(round) + '☆'.repeat(5 - round);
}
