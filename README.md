# Google Form Auto-Submitter

A production-ready full-stack application for parsing and auto-submitting Google Forms. Specially built for high-performance automation, NFT whitelist campaigns, and reliable form entry.

## Features
- **Form Parser:** Extracts form IDs, field entry IDs, and detects CAPTCHAs.
- **Single & Bulk Submission:** Submit single entries or bulk via CSV upload.
- **Randomized Delays:** Human-like submission delays to bypass basic bot protection.
- **Headers Rotation:** Realistic browser headers and User-Agents.
- **Puppeteer Fallback:** Optional fallback to headless browser submission for protected forms.
- **Modern Dashboard:** React (Vite) frontend with glassmorphism UI.
- **Vercel Ready:** Pre-configured for deployment on Vercel.

## Tech Stack
- **Backend:** Node.js, Express, Axios, Puppeteer, CSV-Parser
- **Frontend:** React, Vite, Vanilla CSS
- **Deployment:** Vercel

## Installation

```bash
git clone <repository>
cd google-form-autosubmitter
npm install
```

## Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Adjust the `MIN_DELAY_MS` and `MAX_DELAY_MS` for your desired automation speeds.

## Running Locally

To run both the React frontend and Express backend concurrently:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.
The backend API runs on `http://localhost:3000`.

## Bulk CSV Submission
1. Parse a Google form in the dashboard.
2. Select a CSV file with your data.
3. Map the column names from your CSV to the extracted Google Form `entry.XXXXXX` IDs.
4. Click Start Bulk Submission.

## Vercel Deployment
This project is configured to run on Vercel serverless functions natively.
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. All `/api/*` routes are handled by the Express backend (`api/index.js`).

## Troubleshooting
- **Missing Puppeteer dependencies:** On some Linux environments, you may need to install standard puppeteer dependencies (`libnss3`, `libatk1.0-0`, etc.).
- **Vercel Serverless Function Timeout:** Bulk CSV submissions might exceed Vercel's standard 10s limit. Consider running bulk operations locally or deploying the backend to a VPS for massive jobs.
