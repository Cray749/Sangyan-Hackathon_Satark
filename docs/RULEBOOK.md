# The rule book

The rules live in [`rulebook/rules.json`](../rulebook/rules.json). The people-friendly
version is on the **Rule book** page of the app, in Hindi, Marathi and English.

Each rule has:

- an **id** (R01 to R18),
- a **severity**: **S** can cause STOP alone, **H** is high, **M** is medium,
- the **stage** of the scam journey it usually belongs to,
- one or more **official links** behind it,
- a **status**: **P** means the link is a primary source (SEBI, an exchange or a depository),
  **T** means we rely on a secondary source such as a news report. Every rule is now **P**, but
  the links were found by search and still need a teammate to open each one and confirm it says
  what the rule claims.

| ID | Red flag | Sev | Stage | Source status |
|---|---|---|---|---|
| R01 | Promises assured, guaranteed or "near-certain" returns | H | 1 | P |
| R02 | Says "SEBI registered" but gives no registration number | M | 1 | P |
| R03 | Registration number does not fit its shape or its role | H | 2 | P |
| R04 | Asks for payment to a personal or third-party UPI id or account | S | 3 | P |
| R05 | Presented as a registered intermediary, but the UPI id is not a validated handle | H | 3 | P |
| R06 | Asks for login, password, OTP or remote access | S | none | P |
| R07 | Institutional account, FPI/FII, pre-IPO, block deals, upper circuit, dabba | H | 1 | P |
| R08 | A fee or tax is needed to withdraw | S | 6 | P |
| R09 | App as an APK or a link outside the official store | H | 3 | P |
| R10 | Unsolicited group with a grand name (VIP, Institutional...) | M | 1 | P |
| R11 | Pushes you to hurry or keep it secret | M | none | P |
| R12 | Profit screenshots or success stories used as proof | M | 2 | P |
| R13 | "Pay us to get your money back" | S | 8 | P |
| R14 | Claims to be a SEBI, depository or broker official and asks for money or details | S | none | P |
| R15 | Celebrity or AI-video endorsement | M | 1 | P |
| R16 | Pushes you to invest more or offers a loan to invest | H | 5 | P |
| R17 | Hype words in a tip channel | M | 1 | P |
| R18 | Fake certificates, or a course/mentorship used as the hook | M | 2 | P |

## R05 and the `@valid` handle

SEBI's circular of 11 June 2025 says registered intermediaries collect money on UPI ids that
look like `name.<type>@valid<bank>`. The ten type endings are in
[`rulebook/upi-handles.json`](../rulebook/upi-handles.json), copied from Annexure B:

`brk` stock broker, `bti` banker to an issue, `dp` depository participant, `ra` research
analyst, `ia` investment adviser, `invit`, `mf` mutual fund, `pms` portfolio manager,
`sreit`, `reit`.

- We do **not** hard-code only `brk` and `mf`. A real research analyst uses `.ra`.
- The circular's example `abc.bkr@validhdfc` looks like a typo of `brk`. We use the Annexure
  list and say so when we see it.
- The circular lists 52 banks but prints only two full handles (`validhdfc`, `validicici`).
  We do **not** guess the others. A handle with an unlisted bank code is still checked for
  shape, and the screen says we cannot confirm the bank part.
- **Format is not proof.** Every result says so and sends the person to SEBI Check.

## Where to complain

The routes in the app follow SEBI's own SCORES FAQ: SCORES does **not** take complaints about
unregistered or unregulated activity, so fake apps and groups go to 1930 and
cybercrime.gov.in. See `engine/planner.ts` and the **routes** text in `i18n/*`.

## Open checks before the final submission

- [ ] Open the new primary links for R03, R10, R13, R14 and R15 and confirm each says what
      the rule claims. (R13 points at SEBI's press-release search for "Refund"; replace it with
      the direct link to PR 22/2022 of 7 July 2022.)
- [ ] Re-read every complaint route against the linked pages, line by line. This is the one
      place where a wrong answer could hurt a real person.
- [ ] Confirm the figures from news sources in the PRD before they go on a slide.
- [ ] Have a native Hindi speaker and a native Marathi speaker read `i18n/hi.ts`,
      `i18n/mr.ts` and the word lists.
- [ ] Optional: add the BSE caution as a second source for R07 after checking its date.
