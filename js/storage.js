// ── localStorage persistence ──────────────────────────────────────────────────

function saveEntries()      { localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)); }
function saveUsed()         { localStorage.setItem(USED_KEY,    JSON.stringify(usedNums)); }
function saveReviewsLocal() { localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)); }
function savePricesLocal()  { localStorage.setItem(PRICES_KEY,  JSON.stringify(prices)); }
