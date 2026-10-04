# Satark - pause before you pay

Satark follows an investment scam as it happens. You paste what you see, and it tells you
which stage of the scam you are in, what the scammer will do next, and the one safe thing to
do now. Built for SANGYAN (IIT BHU, with SEBI and NSDL), Track A.

It never says "safe", never gives stock tips or predictions, and never reads SMS or OTPs.
This is not legal or financial advice. The full plan is in [docs/PRD.md](docs/PRD.md).

## Run it

With Docker:

```bash
docker compose up --build
```

Without Docker (Node 20 or newer):

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The AI reader is optional. Copy `.env.example` to `.env`
only if you want to add a key; everything else works without it.

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

## Folders

- `engine/` pure TypeScript checks, no network calls
- `rulebook/` the rules and their official source links
- `app/` the Next.js pages
- `docs/` the PRD and the problem statement

## Status

Early. So far: app shell, Docker, CI, and the R05 check for SEBI `@valid` UPI ids.
