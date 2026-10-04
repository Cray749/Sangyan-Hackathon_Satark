# Guardrails: what Satark will never do, and where the code keeps that promise

The hackathon says solutions must protect investors, not push them to trade. This page maps
each rule to the code and the test that enforces it, so anyone can check.

| Guardrail | How we meet it | Code | Test |
|---|---|---|---|
| No stock tips, buy/sell/hold, predictions or promotion | We judge how a **message** behaves, never a stock. Every sentence we show comes from checked templates and passes an output guard | `engine/guardrails.ts`, `i18n/*` | `engine/guardrails.test.ts` runs **every string in every language** through the guard |
| Never name a broker or a product | The guard blocks common broker names. We only link to official regulator pages | `engine/guardrails.ts`, `engine/links.ts` | same file |
| Never say "safe" | The verdict has four levels and none is a green light. The word is blocked everywhere except the sentence that says we never use it | `engine/verdict.ts` | `engine/verdict.test.ts`, `engine/guardrails.test.ts`, `eval/eval.test.ts` (0 violations) |
| The AI never decides | The verdict code does not import the AI. The AI can only quote words from the message, and a quote that is not in the text is thrown away | `engine/verdict.ts`, `engine/ai-facts.ts` | `engine/verdict.test.ts` checks the imports, `engine/ai-facts.test.ts` |
| A message cannot give orders to the checker | The rules read the text as data. The AI is told to ignore orders in the text, and it cannot lower a verdict anyway | `engine/ai-facts.ts` | `engine/analyze.test.ts`, `eval/eval.test.ts` (10 injection tricks, 0 got through) |
| A warning cannot be used as cover | The context guard ignores red-flag words in a warning post only when there is **no live ask** | `engine/guard.ts` | `engine/guard.test.ts`, adversarial set |
| No raw text on the server | The radar database has no text column, and the API refuses any extra field | `lib/server/radar-store.ts`, `app/api/radar/route.ts` | `lib/server/radar-store.test.ts`, `app/api/radar/route.test.ts` |
| No reading of SMS or OTPs | We have no SMS access at all. The person chooses what to paste. OTP digits are masked before reading | `engine/redact.ts` | `engine/redact.test.ts` |
| Private numbers are hidden first | Phone, Aadhaar, PAN, account, email and OTP digits are masked with a mask of the same length | `engine/redact.ts` | `engine/redact.test.ts` |
| Be clear about uncertainty | CANNOT VERIFY is a normal answer. No fake percentage score anywhere | `engine/verdict.ts` | `engine/verdict.test.ts` |
| No monetisation | Free, no ads, no affiliate links, no premium plan | (nothing to build) | |
| The one thing we predict | Only the next step of a known scam script, and the screen says so | `i18n/*` (`ui.predictNote`) | |

## Our own choices, not rules from a regulator

These are decisions we made and want people to be able to argue with:

- **How many flags make a STOP.** One "can stop alone" flag (R04, R06, R08, R13, R14), or two
  high flags, or one high and two medium. One high flag is HIGH RISK. One medium flag alone is
  CANNOT VERIFY. See `engine/verdict.ts`.
- **When the context guard switches off.** If the message also has a payment request, a UPI id,
  a bank account or an outside link, a "warning" sentence is not trusted.
- **Which stage a flag belongs to.** See `rulebook/rules.json`.

## Not legal or financial advice

Satark says so on every page. It cannot tell whether a person or company is real. Only
[SEBI Check](https://siportal.sebi.gov.in/intermediary/sebi-check) can, and we always send
people there.
