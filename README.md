# Pathwisse

Pathwisse is an AI-powered learning and career management system. This repository contains the initial product foundation and a responsive onboarding shell for the future voice-led experience.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4
- shadcn/ui conventions with local, owned components
- Zustand for onboarding state
- OpenAI Realtime API boundary for WebRTC session setup
- Environment placeholders for Supabase and Razorpay

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```bash
   copy .env.example .env.local
   ```

   On macOS or Linux, use `cp .env.example .env.local`.

3. Add the credentials required for the feature you are working on.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000/onboarding](http://localhost:3000/onboarding).

## Project structure

```text
app/
  api/realtime-session/   Server-only OpenAI Realtime handshake route
  onboarding/             Onboarding route
components/
  onboarding/             Onboarding composition and step UI
  voice/                  Voice experience components
  career/                 Future career feature components
  roadmap/                Future roadmap components
  ui/                     shadcn/ui components owned by the app
stores/
  onboarding-store.ts     Shared persisted state for UI and future assistant tools
lib/
  openai/                 Server-side OpenAI configuration
  realtime/               Shared WebRTC and Realtime constants
  tools/                  Future assistant tool registry
  career/                 Career-domain helpers
types/                     Reusable onboarding, voice, and career types
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The voice UI is intentionally a placeholder in this phase. No microphone capture, mock responses, Supabase data access, or Razorpay flows are implemented yet.
