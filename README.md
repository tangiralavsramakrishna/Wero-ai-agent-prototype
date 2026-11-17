# WERO AI Founder Demo — Gemini update

This update switches the prototype from OpenAI to Google's Gemini API using Google's OpenAI-compatible Chat Completions endpoint.

## Files in this update
- `app/api/agent/route.ts` — Gemini endpoint, model and key configuration.
- `.env.example` — new environment variable names.
- `README.md` — updated setup instructions.

## Vercel environment variables
Add:
- `GEMINI_API_KEY` = your Google AI Studio key
- `GEMINI_MODEL` = `gemini-3.8-flash`

Remove the old `OPENAI_API_KEY` and `OPENAI_MODEL` variables.

## Important
Use only fictional demo data. Do not submit real patient or sensitive health information. Google says Free Tier content may be used to improve its products. Free-tier model access and quotas can change; check the limits in AI Studio. The demo booking list is held in server memory and is not persistent.
