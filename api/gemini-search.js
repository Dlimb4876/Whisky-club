export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured in environment');
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
    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
