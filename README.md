# Whisky Club

Whisky club selector tool — pick a number, taste the dram.

## Features

- Add whisky entries (number + 4th/5th Edition name)
- Random number picker from unused entries
- Per-person star ratings and tasting notes
- Cloud sync via JSONBin
- AI-powered best UK price search via Gemini

## Project Structure

```
Whisky-club/
├── index.html          # Main HTML – page structure only
├── css/
│   └── styles.css      # All visual styles and layout
├── js/
│   ├── config.js       # Constants, API keys, and shared app state
│   ├── utils.js        # Helper functions (escHtml, flash, calcAvg, starsHtml)
│   ├── storage.js      # localStorage persistence (save/load entries, reviews, prices)
│   ├── ratings.js      # Per-person star rating UI and average calculation
│   ├── entries.js      # Whisky entries management and rendering
│   ├── reviews.js      # Tasting notes management and rendering
│   ├── sync.js         # Cloud sync (JSONBin push/pull)
│   ├── price.js        # AI best-price search (Gemini API)
│   └── app.js          # Number selection, event listeners, and app initialisation
└── README.md
```

## Script load order

All scripts share a single global scope (no module system). They are loaded in the order below so that each file's functions are available by the time `app.js` runs the initialisation code:

1. `config.js` — shared constants and state variables (must be first)
2. `utils.js` — pure helper functions
3. `storage.js` — localStorage wrappers, uses keys from `config.js`
4. `ratings.js` — uses `calcAvg`/`starsHtml` from `utils.js`
5. `entries.js` — uses storage, utils, and calls `syncPush` from `sync.js`
6. `reviews.js` — uses storage, ratings, utils, and calls `syncPush` from `sync.js`
7. `sync.js` — calls `renderEntries`/`renderReviews` and storage helpers
8. `price.js` — uses `escHtml` from `utils.js`
9. `app.js` — ties everything together; runs init and wires up event listeners

> **Note:** `entries.js`, `reviews.js`, and `sync.js` call functions that are defined in each other's files. This is safe because all cross-file calls happen at **runtime** (user interaction or `app.js` init), by which point all scripts are fully loaded. There are no module-level imports.

## Security note

The JSONBin and Gemini API keys are currently embedded in `js/config.js` and `js/price.js` respectively. For a production deployment these should be moved to a server-side proxy so the keys are not visible in the browser's source view.
