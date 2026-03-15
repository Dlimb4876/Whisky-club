// ── Storage keys ─────────────────────────────────────────────────────────────
const ENTRIES_KEY  = 'whisky-club-entries';
const USED_KEY     = 'whisky-club-used';
const REVIEWS_KEY  = 'whisky-club-reviews';
const PRICES_KEY   = 'whisky-club-prices';

// ── JSONBin cloud sync ────────────────────────────────────────────────────────
const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
const JSONBIN_KEY  = '$2a$10$7sndeshKqvuoqFr.LDI8eOHtIomBtO83.wPskt3Y33i0NfNekDisC';
const JSONBIN_BIN  = '69b6b0bbb7ec241ddc6e2ca0';

// ── Club members ──────────────────────────────────────────────────────────────
const PERSONS = ['Kev', 'John', 'Dan', 'Morgan'];

// ── App state ─────────────────────────────────────────────────────────────────
let entries  = JSON.parse(localStorage.getItem(ENTRIES_KEY)  || '{}');
let usedNums = JSON.parse(localStorage.getItem(USED_KEY)     || '[]');
let reviews  = JSON.parse(localStorage.getItem(REVIEWS_KEY)  || '[]');
let prices   = JSON.parse(localStorage.getItem(PRICES_KEY)   || '[]');

let currentNum     = null;
let currentRatings = {};
