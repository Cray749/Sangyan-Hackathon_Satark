# How we measured Satark

We report every number, good or bad. The same numbers are on the **Trust report** page of the
app, which reads [`eval/results.json`](../eval/results.json). Nobody types them by hand.

```bash
npm run eval:build   # rebuild the labelled set (same seed, same 400 every time)
npm run eval         # run Satark on it with the AI switched off and write eval/results.json
npm test             # includes the same run, and fails if a promise or a floor breaks
```

## The test set

**400 messages**, made by us and labelled when they were made (see `eval/bank*.ts`).

| Kind | Count | What it is |
|---|---|---|
| Scam messages | 180 | What a scammer sends: hooks, trust building, fake apps, pressure, withdrawal fees, recovery scams, login theft, tip-channel hype |
| Victim stories | 60 | A person describing what happened to them (stage 4 to 8) |
| Genuine | 100 | Real-looking depository, bank, broker and mutual-fund notices, OTP messages, debit alerts |
| Hard | 60 | Warning posts, news about arrests, teaching posts, vague greetings, a real registration number, a scammer who claims one |

By style: English 125, Hindi 110, Hinglish 70, Marathi 95.

A separate **adversarial set of 40** tries to fool a checker: orders hidden in the text
(prompt injection), spaced-out and look-alike letters, emoji between words, a warning used as
cover, claims like "not a scam, 100% legit".

## What we compare against

A plain **keyword filter** (any scary word means "scam"), the kind simple detectors use.

## Results (AI off, rule book 0.1.0)

| Measure | Satark | Keyword filter |
|---|---|---|
| Scam messages stopped (STOP or HIGH RISK) | **98.2%** | 71.8% |
| ...of those, scams at stages 1 to 3 | **96.3%** | |
| Genuine messages wrongly scared | **0%** | 38.2% |
| Scams wrongly called "no red flags" | **0%** | |
| Victims who had lost money, Emergency Mode opened | **100%** | |
| Stage named exactly right / within one step | 88.4% / 92.1% | |
| Said CANNOT VERIFY | 10.8% | |
| Right, when it did decide | 100% | |
| Answers that said "safe" | **0** | |
| Prompt-injection tricks that softened a verdict | **0 of 10** | |
| Adversarial set: caught / wrongly scared | 97% / 0% | |

By language, scams caught: English 100%, Hindi 100%, Hinglish 94.1%, Marathi 97.3%.

## Honest limits

Please read these before quoting any number.

1. **The data is synthetic.** We made the messages. Accuracy on real messages is not proven.
   The next step is a pilot on real, anonymised cases with SEBI's help.
2. **We tuned the word lists while looking at these same messages.** The first run, before any
   tuning, caught 75% and wrongly scared 7.2%. The numbers above are therefore better than a
   fresh test would show. A message set written by someone who did not write the rules is the
   fix, and the PRD asks for exactly that.
3. **The 40 tricks were also written by us.** We added protection for spaced and look-alike
   letters and emoji *after* seeing them fail, so that score is not a blind test either.
   One trick still gets through: numbers in place of letters (`Gu4r4nt33d`).
4. **"Right when it did decide: 100%"** is a result of point 2. Do not read it as a promise.
5. **Weak signals stay weak.** A message with one medium sign (for example only "see our
   success stories") reaches CANNOT VERIFY, not STOP. We labelled those items `flag` (must
   not be called clear), and 100% of them were not called clear.
6. **The AI helper was not part of this run.** The comparison "same AI with no rule gate" from
   the PRD needs an API key. The code for the AI-on path is tested with a fake model.
7. **Only three languages**, and the Marathi and Hindi wording still needs a native check.

## What the build enforces

`eval/eval.test.ts` fails the build if any of these breaks:

- 0 "safe" answers, 0 injection tricks that soften a verdict,
- at most 2% of scams called clear,
- scam catch rate at least 90% and better than the keyword filter,
- at most 5% of genuine messages wrongly scared, and far fewer than the keyword filter,
- Emergency Mode for at least 90% of victims who had lost money,
- every language style at least 85% caught and at most 5% wrongly scared.

These are floors to stop us going backwards, not targets.

## Still to do

- [ ] A teammate who did not write the rules writes a fresh 40, and a fresh 100 genuine notices.
- [ ] Mini user test with 5 to 8 people in Hindi: can they say what to do next, and how fast?
- [ ] AI-on versus AI-off with a real key.
