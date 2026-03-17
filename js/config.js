// ── Hardcoded whisky list (1–100) ─────────────────────────────────────────────
const WHISKY_LIST = [
  'Laphroaig 10 Year',
  'Lagavulin 16 Year',
  'Ardbeg Ten',
  'Talisker 10 Year',
  'Oban 14 Year',
  'Macallan 12 Year Sherry Oak',
  'Glenfiddich 12 Year',
  'The Balvenie DoubleWood 12',
  'Glenmorangie The Original',
  'Highland Park 12 Year (Viking Honour)',
  'Bruichladdich The Classic Laddie',
  'Aberlour 12 Year Double Cask',
  'Bunnahabhain 12 Year',
  'Caol Ila 12 Year',
  'Springbank 10 Year',
  'Glenlivet 12 Year',
  'Dalwhinnie 15 Year',
  'Bowmore 12 Year',
  'Jura 10 Year',
  'Mortlach 12 Year (The Wee Witchie)',
  'Glendronach 12 Year',
  'Old Pulteney 12 Year',
  'Glenfarclas 105',
  'Kilchoman Machir Bay',
  'Port Charlotte 10 Year',
  'Glenkinchie 12 Year',
  'Clynelish 14 Year',
  'Craigellachie 13 Year',
  'Benromach 10 Year',
  'Arran 10 Year',
  'Deanston 12 Year',
  'Royal Brackla 12 Year',
  'Tamdhu 12 Year',
  'Glengoyne 10 Year',
  'Johnnie Walker Black Label',
  'Johnnie Walker Blue Label',
  'Chivas Regal 12 Year',
  'Monkey Shoulder (Blended Malt)',
  'Compass Box The Peat Monster',
  "Dewar's White Label",
  'Buffalo Trace',
  'Eagle Rare 10 Year',
  "Blanton's Single Barrel",
  "Maker's Mark",
  'Woodford Reserve',
  'Bulleit Bourbon',
  'Knob Creek 9 Year',
  'Wild Turkey 101',
  "Basil Hayden's",
  'Old Forester 1910',
  'Elijah Craig Small Batch',
  'Four Roses Single Barrel',
  "Michter's US*1 Bourbon",
  "Angel's Envy (Port Wine Finish)",
  'Booker\'s (Small Batch)',
  'George T. Stagg',
  'Pappy Van Winkle 15 Year',
  "Jack Daniel's Old No. 7",
  "Jack Daniel's Single Barrel Select",
  'George Dickel No. 12',
  'Rittenhouse Rye',
  'Sazerac Rye',
  'WhistlePig 10 Year Rye',
  'High West Rendezvous Rye',
  'Knob Creek Rye',
  'Bulleit Rye',
  'Old Overholt Rye',
  'Balcones Texas Single Malt',
  'Westward American Single Malt',
  "Stranahan's Colorado Whiskey",
  'Jameson Original',
  'Bushmills Original',
  'Redbreast 12 Year',
  'Teeling Small Batch',
  'Tullamore D.E.W.',
  'Green Spot',
  'Yellow Spot',
  'Powers Gold Label',
  "Writer's Tears Copper Pot",
  'Connemara Peated Single Malt',
  'Roe & Co',
  'Slane Irish Whiskey',
  'Knappogue Castle 12 Year',
  'Redbreast Lustau Edition',
  'Midleton Very Rare',
  'Yamazaki 12 Year (Japan)',
  'Hibiki Japanese Harmony (Japan)',
  'Nikka From The Barrel (Japan)',
  'Hakushu 12 Year (Japan)',
  'Suntory Toki (Japan)',
  'Yoichi Single Malt (Japan)',
  'Akashi White Oak (Japan)',
  'Kavalan Classic (Taiwan)',
  'Amrut Fusion (India)',
  'Paul John Edited (India)',
  'Crown Royal Deluxe (Canada)',
  'Lot No. 40 Rye (Canada)',
  'Penderyn Madeira Finish (Wales)',
  'Starward Nova (Australia)',
  'Mackmyra Svensk Ek (Sweden)'
];

// ── Storage keys ─────────────────────────────────────────────────────────────
const ENTRIES_KEY  = 'whisky-club-entries';
const USED_KEY     = 'whisky-club-used';
const REVIEWS_KEY  = 'whisky-club-reviews';
const PRICES_KEY   = 'whisky-club-prices';
const SESSION_KEY  = 'whisky-club-session';

// ── JSONBin cloud sync ────────────────────────────────────────────────────────
const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
const JSONBIN_KEY  = '$2a$10$7sndeshKqvuoqFr.LDI8eOHtIomBtO83.wPskt3Y33i0NfNekDisC';
const JSONBIN_BIN  = '69b6b0bbb7ec241ddc6e2ca0';

// ── Club members ──────────────────────────────────────────────────────────────
const PERSONS = ['Kev', 'John', 'Dan', 'Morgan'];

// ── App state ─────────────────────────────────────────────────────────────────
let entries  = {};
let usedNums = [];
let reviews  = JSON.parse(localStorage.getItem(REVIEWS_KEY)  || '[]');
let prices   = JSON.parse(localStorage.getItem(PRICES_KEY)   || '[]');

let currentNum     = null; // set to the active slot's number when reviewing
let currentNum1    = null; // slot 1 selected number
let currentNum2    = null; // slot 2 selected number
let activeSlot     = null; // which slot's review form is open (1 or 2)
let currentRatings = {};
let rollsLocked    = true; // roll buttons locked until "Roll Next Session" is clicked
