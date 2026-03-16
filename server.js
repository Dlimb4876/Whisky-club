const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY not set in environment variables');
}

// Proxy endpoint for Gemini API
app.post('/api/gemini-search', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 1024 }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `API error ${response.status}`;
      console.error('Gemini API error:', errMsg);
      return res.status(response.status).json({ error: errMsg });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

app.listen(PORT, () => {
  console.log(`Whisky Club server running on http://localhost:${PORT}`);
});
