# Whisky Club Setup Guide

## Prerequisites

- Node.js 14+ installed
- A Google Generative Language API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key to .env:**
   Edit `.env` and replace `your_api_key_here` with your actual Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

## Running the Application

**Development mode:**
```bash
npm start
```

The application will:
- Serve the frontend on `http://localhost:3000`
- Provide API endpoint at `http://localhost:3000/api/gemini-search`

## Security Notes

- **API Key Protection**: The Gemini API key is now stored securely in `.env` on the server side
- **No Client-Side Credentials**: The frontend no longer exposes any API keys
- **CORS Handling**: The backend proxy handles CORS, preventing browser restrictions
- **Error Messages**: API errors are safely forwarded to the frontend without exposing internal details

## How It Works

1. Frontend submits a whisky name to `/api/gemini-search`
2. Backend proxy receives the request and adds the API key securely
3. Backend forwards the request to Google's Generative Language API
4. Response is returned to frontend for display

This approach fixes the 403 error by:
- Removing the exposed API key from the browser
- Handling the API call server-side where CORS doesn't apply
- Using proper authentication headers
