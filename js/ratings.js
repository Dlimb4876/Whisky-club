// ── Per-person star ratings ───────────────────────────────────────────────────

function resetRatings() {
  currentRatings = {};
  PERSONS.forEach(function(p) { currentRatings[p.toLowerCase()] = 0; });
}

function buildPersonRatingRows() {
  const container = document.getElementById('personRatings');
  container.innerHTML = '';

  PERSONS.forEach(function(person) {
    const key = person.toLowerCase();
    const row = document.createElement('div');
    row.className = 'person-rating-row';

    const label = document.createElement('span');
    label.className   = 'person-label';
    label.textContent = person + ':';

    const starRow = document.createElement('div');
    starRow.className       = 'star-row';
    starRow.dataset.person  = key;

    for (var v = 1; v <= 5; v++) {
      (function(val) {
        var star = document.createElement('span');
        star.className      = 'star';
        star.textContent    = '★';
        star.dataset.value  = val;
        star.dataset.person = key;

        star.addEventListener('click', function() { setPersonRating(key, val); });
        star.addEventListener('mouseover', function() {
          starRow.querySelectorAll('.star').forEach(function(s) {
            s.style.color = parseInt(s.dataset.value) <= val ? '#e0a830' : '';
          });
        });
        star.addEventListener('mouseleave', function() {
          starRow.querySelectorAll('.star').forEach(function(s) { s.style.color = ''; });
        });
        starRow.appendChild(star);
      })(v);
    }

    row.appendChild(label);
    row.appendChild(starRow);
    container.appendChild(row);
  });

  updateAvgDisplay();
}

function setPersonRating(personKey, value) {
  currentRatings[personKey] = value;
  const row = document.querySelector('.star-row[data-person="' + personKey + '"]');
  if (row) {
    row.querySelectorAll('.star').forEach(function(s) {
      s.classList.toggle('active', parseInt(s.dataset.value) <= value);
    });
  }
  updateAvgDisplay();
}

function updateAvgDisplay() {
  const avg = calcAvg(currentRatings);
  const el  = document.getElementById('avgDisplay');
  if (avg === 0) {
    el.innerHTML = 'Average: <span class="avg-val">—</span>';
    return;
  }
  el.innerHTML =
    'Average: <span class="avg-stars">' + starsHtml(avg) + '</span>' +
    ' <span class="avg-val">(' + avg.toFixed(1) + ')</span>';
}
