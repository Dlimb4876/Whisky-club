// Copy this file to js/env.js and fill in your actual API key.
// js/env.js is gitignored — never commit real keys.
//
// Reference from environment — never hardcode:
//   const apiKey = process.env.GEMINI_API_KEY;
//
// For this vanilla-JS project (no build tool), we expose the key
// via a global window.ENV object loaded before the app scripts.

window.ENV = {
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE'
};
