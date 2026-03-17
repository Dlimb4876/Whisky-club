// ── Price Search (Amazon UK + Masters of Malt via Gemini) ─────────────────────

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

  var safeName = whiskyName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  var prompt =
    'Find the current UK retail price for "' + safeName + '" whisky.\n' +
    'Search specifically on:\n' +
    '1. Amazon UK (amazon.co.uk)\n' +
    '2. Master of Malt (masterofmalt.com)\n\n' +
    'End your response with exactly these two lines (fill in real values):\n' +
    'AMAZON: [price e.g. £45.95 or N/A] | [direct product URL on amazon.co.uk or N/A]\n' +
    'MASTERSOFMALT: [price e.g. £42.00 or N/A] | [direct product URL on masterofmalt.com or N/A]';

  try {
    var resp = await fetch(API_BASE_URL + '/gemini-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!resp.ok) {
      var errBody = await resp.json().catch(function() { return {}; });
      throw new Error(errBody.error || 'API error ' + resp.status);
    }

    var data      = await resp.json();
    var candidate = (data.candidates || [])[0];
    var parts     = (candidate && candidate.content && candidate.content.parts) || [];
    var textParts = parts.filter(function(p) { return p.text; });
    if (!textParts.length) throw new Error('No text response from AI.');

    var text = textParts[textParts.length - 1].text;

    var amazonMatch = text.match(/AMAZON:\s*(.+?)\s*\|\s*(\S+)/i);
    var momMatch    = text.match(/MASTERSOFMALT:\s*(.+?)\s*\|\s*(\S+)/i);

    var html = '<div class="price-results">';

    if (amazonMatch) {
      var aPrice = amazonMatch[1].trim();
      var aUrl   = amazonMatch[2].replace(/[.,)>]+$/, '').trim();
      html += buildPriceRow('Amazon', 'amazon', aPrice, aUrl);
    }

    if (momMatch) {
      var mPrice = momMatch[1].trim();
      var mUrl   = momMatch[2].replace(/[.,)>]+$/, '').trim();
      html += buildPriceRow('Masters of Malt', 'mom', mPrice, mUrl);
    }

    if (!amazonMatch && !momMatch) {
      html += '<p class="no-prices">Could not find prices for this whisky.</p>';
    }

    html += '</div>';
    containerEl.innerHTML = html;

  } catch (err) {
    containerEl.innerHTML = '<p class="no-prices">Error: ' + escHtml(err.message || 'Unknown error') + '</p>';
  }
}

function buildPriceRow(retailerName, retailerClass, price, url) {
  var isNA = !url || url === 'N/A' || price === 'N/A';
  var priceHtml = isNA
    ? '<span class="price-na">Not listed</span>'
    : '<span class="price-amount-val">' + escHtml(price) + '</span>';
  var linkHtml = (!isNA && url.startsWith('http'))
    ? '<a href="' + escHtml(url) + '" target="_blank" rel="noopener noreferrer" class="ai-buy-link">Buy →</a>'
    : '';
  return '<div class="price-row price-row--' + retailerClass + '">' +
    '<span class="price-retailer-name">' + escHtml(retailerName) + '</span>' +
    priceHtml +
    linkHtml +
    '</div>';
}
