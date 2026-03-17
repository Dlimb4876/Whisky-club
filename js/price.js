// ── Price Search (Amazon UK + Masters of Malt) ─────────────────────────────────

var API_BASE_URL = (window.ENV && window.ENV.API_BASE_URL) || '/api';

function renderPriceTracker(num, slot) {
  var entry = entries[num] || {};
  var whiskyName = entry.ed4 || entry.ed5 || '';
  if (!whiskyName) return;
  var containerEl = document.getElementById('priceResult' + slot);
  if (!containerEl) return;
  searchWhiskyPrices(whiskyName, containerEl);
}

async function searchWhiskyPrices(whiskyName, containerEl) {
  containerEl.innerHTML = '<p class="ai-searching">🔍 Fetching prices…</p>';

  try {
    var resp = await fetch(API_BASE_URL + '/price-scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whiskyName: whiskyName })
    });

    if (!resp.ok) {
      var errBody = await resp.json().catch(function() { return {}; });
      throw new Error(errBody.error || 'API error ' + resp.status);
    }

    var data   = await resp.json();
    var mom    = data.mom    || {};
    var amazon = data.amazon || {};

    var html = '<div class="price-results">';
    html += buildPriceRow('Amazon',          'amazon', amazon.price, amazon.url, amazon.price ? 'Buy \u2192' : 'Search \u2192');
    html += buildPriceRow('Masters of Malt', 'mom',    mom.price,    mom.url,    mom.found && mom.price ? 'Buy \u2192' : 'Search \u2192');
    html += '</div>';
    containerEl.innerHTML = html;

  } catch (err) {
    containerEl.innerHTML =
      '<p class="no-prices">Error: ' + escHtml(err.message || 'Unknown error') + '</p>' +
      '<button class="btn-price-retry" onclick="searchWhiskyPrices(' +
        JSON.stringify(whiskyName) + ', this.parentElement)">🔄 Retry</button>';
  }
}

function buildPriceRow(retailerName, retailerClass, price, url, linkText) {
  var hasPrice = price && price !== 'N/A';
  var hasUrl   = url && url !== 'N/A' && url.startsWith('http');
  var priceHtml = hasPrice
    ? '<span class="price-amount-val">' + escHtml(price) + '</span>'
    : (hasUrl ? '' : '<span class="price-na">Not listed</span>');
  var linkHtml = hasUrl
    ? '<a href="' + escHtml(url) + '" target="_blank" rel="noopener noreferrer" class="ai-buy-link">' + escHtml(linkText || 'Buy \u2192') + '</a>'
    : '';
  return '<div class="price-row price-row--' + retailerClass + '">' +
    '<span class="price-retailer-name">' + escHtml(retailerName) + '</span>' +
    priceHtml +
    linkHtml +
    '</div>';
}
