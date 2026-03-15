// ── AI Price Search (Gemini) ──────────────────────────────────────────────────

// Reference from environment — never hardcode
var GEMINI_API_KEY = (window.ENV && window.ENV.GEMINI_API_KEY) || '';

function renderPriceTracker(num) {
  document.getElementById('aiSearchResult').innerHTML = '';
  searchWhiskyPriceWithAI();
}

async function searchWhiskyPriceWithAI() {
  if (currentNum === null) return;
  var entry = entries[currentNum] || {};
  var whiskyName = entry.ed4 || entry.ed5 || '';
  if (!whiskyName) {
    document.getElementById('aiSearchResult').innerHTML =
      '<p class="no-prices">No whisky name found for this entry.</p>';
    return;
  }

  var resultEl = document.getElementById('aiSearchResult');
  resultEl.innerHTML = '<p class="ai-searching">🔍 Searching for the best UK price…</p>';

  try {
    var resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: 'Find the cheapest current UK price for "' + whiskyName.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '" whisky. Check retailers like The Whisky Exchange, Master of Malt, Amazon UK, and others. End your response with exactly this line (fill in real values):\nRESULT: [price e.g. £45.95] | [retailer name] | [direct product URL]'
            }]
          }],
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 1024 }
        })
      }
    );

    if (!resp.ok) {
      var errBody = await resp.json().catch(function() { return {}; });
      var errMsg  = (errBody.error && errBody.error.message) ? errBody.error.message : 'API error ' + resp.status;
      throw new Error(errMsg);
    }

    var data      = await resp.json();
    var candidate = (data.candidates || [])[0];
    var parts     = (candidate && candidate.content && candidate.content.parts) || [];
    var textParts = parts.filter(function(p) { return p.text; });
    if (textParts.length === 0) throw new Error('No text response received from AI.');

    var text        = textParts[textParts.length - 1].text;
    var resultMatch = text.match(/RESULT:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(https?:\/\/\S+)/i);

    if (resultMatch) {
      var price    = resultMatch[1].trim();
      var retailer = resultMatch[2].trim();
      var url      = resultMatch[3].replace(/[.,)>]+$/, '').trim();
      resultEl.innerHTML =
        '<div class="ai-result-card">' +
        '<span class="ai-price">'    + escHtml(price)    + '</span>' +
        '<span class="ai-retailer">' + escHtml(retailer) + '</span>' +
        '<a href="' + escHtml(url) + '" target="_blank" rel="noopener noreferrer" class="ai-buy-link">Buy Now →</a>' +
        '</div>';
    } else {
      // Fallback: extract any price + URL from text
      var priceMatch = text.match(/£[\d,]+\.?\d*/);
      var urlMatch   = text.match(/https?:\/\/[^\s<>"')]+/);
      resultEl.innerHTML =
        '<div class="ai-result-card">' +
        (priceMatch ? '<span class="ai-price">' + escHtml(priceMatch[0]) + '</span>' : '') +
        (urlMatch   ? '<a href="' + escHtml(urlMatch[0].replace(/[.,)>]+$/, '')) + '" target="_blank" rel="noopener noreferrer" class="ai-buy-link">Buy Now →</a>' : '') +
        '<span class="ai-note">' + escHtml(text.slice(0, 300)) + '</span>' +
        '</div>';
    }
  } catch (err) {
    resultEl.innerHTML = '<p class="no-prices">Error: ' + escHtml(err.message || 'Unknown error') + '</p>';
  }
}
