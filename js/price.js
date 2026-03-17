// ── Whisky Info Panel (hardcoded data) ─────────────────────────────────────────

function renderPriceTracker(num, slot) {
  var containerEl = document.getElementById('priceResult' + slot);
  if (!containerEl) return;

  var data = WHISKY_DATA[num];
  if (!data) {
    containerEl.innerHTML = '';
    return;
  }

  containerEl.innerHTML =
    '<div class="whisky-info-panel">' +
      '<div class="whisky-info-region">📍 ' + escHtml(data.region) + '</div>' +
      '<p class="whisky-info-desc">' + escHtml(data.desc) + '</p>' +
      '<div class="whisky-info-price">💰 Avg. price: <span class="whisky-price-val">' + escHtml(data.price) + '</span></div>' +
    '</div>';
}
