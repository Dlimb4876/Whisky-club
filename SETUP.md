# Whisky Club Setup Guide

## Prerequisites

- Node.js 14+ installed (for local development)
- A Google Generative Language API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- A Vercel account (for deployment) - [Sign up free](https://vercel.com)

## Local Development

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
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000` with the API endpoint at `/api/gemini-search`.

## Deployment to Vercel

### Option 1: CLI Deployment (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure environment variables:**
   - During deployment, Vercel will prompt you to set environment variables
   - Or go to your Vercel project dashboard → Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel at [vercel.com](https://vercel.com)
3. Add `GEMINI_API_KEY` environment variable in Vercel project settings
4. Vercel automatically deploys on every push

## Architecture

- **Frontend**: Static HTML/CSS/JS files (served by Vercel)
- **API**: Serverless function at `/api/gemini-search` (Vercel Functions)
- **Gemini API**: Called securely from Vercel backend

## Security

- **API Key Protection**: Stored securely in Vercel environment variables, never exposed
- **No Client-Side Credentials**: Frontend has no access to API keys
- **CORS Handling**: Serverless function handles requests, no CORS issues
- **Error Messages**: API errors are safely handled without exposing internal details

## How It Works

1. User enters a whisky name in the frontend
2. Frontend sends request to `/api/gemini-search`
3. Vercel serverless function receives request with secure API key
4. Function forwards request to Google's Generative Language API
5. Response is returned to frontend for display

This architecture fixes the 403 error by moving the API call server-side where the secret key is safely stored.
