# WERO AI Founder Demo

A standalone Next.js voice-first appointment-booking prototype. It does not use WERO production code, credentials, databases, or patient records.

## What it demonstrates
- Browser microphone input (Chrome/Edge recommended; HTTPS required after deployment)
- OpenAI-powered natural-language booking conversation
- Dummy doctors across Dentistry, Dermatology and Psychiatry
- Dummy slot availability and confirmation flow
- Explicit confirmation before a demo booking is created

## 1. Requirements
- Node.js 20.9+
- An OpenAI API key with API billing enabled
- A free Vercel account

## 2. Run locally
```bash
npm install
cp .env.example .env.local
```
Put your API key in `.env.local`, then:
```bash
npm run dev
```
Open http://localhost:3000

## 3. Deploy to Vercel (free Hobby plan)
1. Create a private GitHub repository and upload these project files.
2. Sign in to https://vercel.com with the founder/demo owner's account.
3. Select **Add New → Project**, import the GitHub repository.
4. Framework should be detected as Next.js. Keep the default build settings.
5. Under **Environment Variables**, add:
   - `OPENAI_API_KEY` = your secret API key
   - `OPENAI_MODEL` = `gpt-4.1-mini`
6. Deploy. Vercel will provide a public `https://....vercel.app` URL.
7. Open the URL in Chrome or Edge, allow microphone access, and test.

## Suggested founder demo script
Say: "Book Dr. Ananya Rao, dermatologist, on 25 November 2026 at 5 PM."
The assistant checks the dummy schedule and asks for confirmation. Say "Yes, confirm the appointment." It returns a clearly labelled demo booking reference.

## Important limitations
- This is a demonstration, not a production booking service.
- All doctor profiles, slots and bookings are dummy data.
- The demo booking array is in server memory and may reset/restart on serverless instances or deployments. It is not a persistent database.
- Browser speech recognition support varies. Use Chrome/Edge over HTTPS and grant microphone permission.
- Speech recognition may use browser-provider services; do not speak real patient or sensitive health information.
- The OpenAI API is usage-billed separately from Vercel. Vercel's free Hobby plan does not include OpenAI API usage.
- Keep `OPENAI_API_KEY` only in Vercel environment variables. Never put it in client-side code or commit it to GitHub.
- Before any real launch, add durable database storage, authentication, rate limiting, robust booking concurrency controls, privacy/legal review, monitoring and production-grade testing.
