export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { whiskyName } = req.body;
  if (!whiskyName) return res.status(400).json({ error: 'whiskyName is required' });

  const encoded = encodeURIComponent(whiskyName);
  const momSearchUrl = 'https://www.masterofmalt.com/whiskies/?q=' + encoded;
  const amazonSearchUrl = 'https://www.amazon.co.uk/s?k=' + encoded + '+whisky&i=grocery';

  // Try to scrape Masters of Malt; fall back to search URL on any failure
  let mom = { price: null, url: momSearchUrl, found: false };

  try {
    const response = await fetch(momSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    if (response.ok) {
      const html = await response.text();
      const parsed = parseMomHtml(html, momSearchUrl);
      if (parsed) mom = parsed;
    }
  } catch (err) {
    // Network error — fall back to search URL
    console.error('MoM fetch error:', err.message);
  }

  return res.status(200).json({
    mom,
    amazon: { price: null, url: amazonSearchUrl, found: false }
  });
}

function parseMomHtml(html, fallbackUrl) {
  // Strategy 1: JSON-LD schema blocks
  const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of jsonLdBlocks) {
    try {
      const content = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
      const data = JSON.parse(content);
      const result = extractFromJsonLd(data, fallbackUrl);
      if (result) return result;
    } catch (e) { /* ignore parse errors */ }
  }

  // Strategy 2: itemprop="price" microdata
  const itemPropMatch = html.match(/itemprop="price"[^>]*content="([\d.]+)"/);
  if (itemPropMatch) {
    const url = extractFirstProductUrl(html) || fallbackUrl;
    return { price: '\u00a3' + parseFloat(itemPropMatch[1]).toFixed(2), url, found: true };
  }

  // Strategy 3: data-price attribute
  const dataPriceMatch = html.match(/data-price="([\d.]+)"/);
  if (dataPriceMatch) {
    const url = extractFirstProductUrl(html) || fallbackUrl;
    return { price: '\u00a3' + parseFloat(dataPriceMatch[1]).toFixed(2), url, found: true };
  }

  // Strategy 4: price in a common price element near a product link
  const priceClassMatch = html.match(/class="[^"]*price[^"]*"[^>]*>\s*\u00a3\s*([\d,]+\.?\d*)/i);
  if (priceClassMatch) {
    const url = extractFirstProductUrl(html) || fallbackUrl;
    const numStr = priceClassMatch[1].replace(',', '');
    return { price: '\u00a3' + parseFloat(numStr).toFixed(2), url, found: true };
  }

  return null;
}

function extractFromJsonLd(data, fallbackUrl) {
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    // Handle @graph array
    if (item['@graph']) {
      const result = extractFromJsonLd(item['@graph'], fallbackUrl);
      if (result) return result;
    }
    if (!item) continue;

    // Direct Product or ItemList
    const types = [].concat(item['@type'] || []);
    if (types.includes('Product') || types.includes('ItemList')) {
      const price = extractOfferPrice(item.offers);
      if (price) {
        const url = item.url || fallbackUrl;
        return { price, url: ensureAbsolute(url), found: true };
      }
    }

    // ItemList containing products
    if (item.itemListElement) {
      for (const el of [].concat(item.itemListElement)) {
        const inner = el.item || el;
        const price = extractOfferPrice(inner.offers);
        if (price) {
          const url = inner.url || el.url || fallbackUrl;
          return { price, url: ensureAbsolute(url), found: true };
        }
      }
    }
  }
  return null;
}

function extractOfferPrice(offers) {
  if (!offers) return null;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  if (!offer) return null;
  const raw = offer.price || offer.lowPrice;
  if (!raw) return null;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return null;
  // Prices are GBP — prepend £
  return '\u00a3' + num.toFixed(2);
}

function extractFirstProductUrl(html) {
  const patterns = [
    /href="(\/whisky\/[^"#?]+)"/i,
    /href="(\/whiskies\/[^"#?]+)"/i,
    /href="(https:\/\/www\.masterofmalt\.com\/whisk[^"#?]+)"/i,
  ];
  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m) return ensureAbsolute(m[1]);
  }
  return null;
}

function ensureAbsolute(url) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return 'https://www.masterofmalt.com' + url;
}
