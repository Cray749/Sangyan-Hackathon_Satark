# Satark - pause before you pay

Satark follows an investment scam **as it happens**. You paste, speak or photograph what you
received. Satark tells you which stage of the scam you are in, what the scammer will do
next, and the one thing to do now. In Hindi, Marathi and English.

Built for **SANGYAN** (IIT BHU, with SEBI and NSDL), Track A: Digital Fraud & Scam Resilience.

> SEBI publishes this scam as a seven-stage poster. We made the poster live and personal.

## What makes it different

- **It follows the story, not one message.** Eight stages (SEBI's seven plus the "recovery
  scam" that comes after). Each new message moves the marker forward.
- **Rules decide, AI only reads.** Every warning sign comes from a versioned rule book with a
  link to the SEBI or exchange page behind it. The optional AI helper can only quote words
  you wrote, and anything it invents is thrown away.
- **It never says "safe".** The best answer is "no red flags found, still verify". A test
  fails if that ever changes.
- **Emergency Mode** when money has gone: one-tap call to 1930, a 15 minute plan, the words
  to say on the phone, and the **right** place to complain (SCORES does not take complaints
  about fake apps and groups).
- **Private by design.** The engine runs in the browser. Your case stays on your phone. The
  server keeps anonymous counts only. Two things can leave the phone, and only if you choose:
  the optional AI helper and screenshots go to Google Gemini (private numbers hidden first,
  nothing stored), and your browser's own speech service may process your voice.
- **Made for Bharat.** Hindi first, voice in and out, works with a weak signal, installs from
  a link, no sign-up.

Read more: [PRD](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) ·
[Guardrails](docs/GUARDRAILS.md) · [Rule book](docs/RULEBOOK.md) · [Evaluation](docs/EVAL.md) ·
[Deploy](docs/DEPLOY.md)

## Run it

With Docker:

```bash
docker compose up --build
```

Without Docker (Node 22 or newer):

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

The AI helper is **optional**. Copy `.env.example` to `.env` and add a `GEMINI_API_KEY` only if
you want it. Everything else, including the full evaluation, works without it.

## Check it

```bash
npm run lint
npm run typecheck
npm test            # unit tests + the evaluation on 440 messages, AI off
npm run eval        # print the measured numbers and refresh eval/results.json
```

## Folders

| Folder | What is in it |
|---|---|
| `engine/` | The pure TypeScript engine: redact, read, guard, rules, journey, verdict, planner. No network |
| `rulebook/` | `rules.json` (R01 to R18 with sources), the UPI handle facts, word lists per language |
| `i18n/` | Every sentence a person reads, in Hindi, Marathi and English, plus tap-to-try examples |
| `app/` | The Next.js pages and API routes |
| `lib/` | Browser helpers (case file, voice, QR) and server helpers (radar store, AI reader) |
| `eval/`, `data/` | The labelled test set, the baseline, the metrics and the results |
| `docs/` | PRD and the explanations |

## How a STOP is decided (our own choice, argue with it)

One flag that can stop alone (taking money to a personal account, asking for a password or OTP,
a fee to withdraw, a fee to recover money, a fake official), or two high flags, or one high
and two medium. One high flag is HIGH RISK. One medium flag alone is CANNOT VERIFY.
These counts are ours, not a regulator's. See `engine/verdict.ts`.

## Honest limits

Our test messages are made up and the word lists were tuned while looking at them, so the
numbers on the Trust report page are better than a fresh test would show. Satark cannot tell
whether a person or company is real. Only [SEBI Check](https://siportal.sebi.gov.in/intermediary/sebi-check)
can, and Satark always sends people there. Hindi and Marathi wording needs a native reader.
This is not legal or financial advice.

## Status

Working: check box (type, voice, screenshot with the AI helper), scam thread, rule book,
Why panel, Pre-Pay Check with QR scan, Emergency Mode, family alert, three languages, Trust
report, Scam Radar, offline install, Docker, CI.

Not built on purpose: stock tips, predictions, ratings, any payments or ads, reading SMS or OTPs.

Not built yet: NSE caution-channel match, more languages, a WhatsApp bot on the same engine.
