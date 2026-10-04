import { getRule, ruleBook } from "./rulebook";
import type { Fact, FactKind, Flag, RuleId, Span } from "./types";
import { checkUpiId } from "./upi";

// Turns facts into red flags. This is where the rule book decides, not any AI.
// Most rules are one fact = one rule. R02 to R05 combine several clues, so they live here.

const MAX_EVIDENCE = 4;

// SEBI registration numbers look like INA000012345: three letters, then nine digits.
// The third letter says what kind of intermediary it is.
const VALID_THIRD_LETTER = new Set(["a", "h", "z", "p", "m", "b", "f", "r"]);
const REG_DIGITS = 9;

// If the message says what the person claims to be, the number must fit that role.
const ROLE_TO_LETTERS: { say: RegExp; letters: string[] }[] = [
  { say: /investment\s+advis[eo]r|निवेश\s*सलाहकार|गुंतवणूक\s*सल्लागार/i, letters: ["a"] },
  { say: /research\s+analyst|रिसर्च\s*एनालिस्ट/i, letters: ["h"] },
  { say: /stock\s*broker|ब्रोकर/i, letters: ["z", "b", "f"] },
  { say: /portfolio\s+manager/i, letters: ["p"] },
];

function spansOf(facts: Fact[], kind: FactKind): Span[] {
  return facts.filter((f) => f.kind === kind && !f.ignored).map((f) => f.span);
}

function flag(ruleId: RuleId, evidence: Span[]): Flag {
  return { ruleId, severity: getRule(ruleId).severity, evidence: evidence.slice(0, MAX_EVIDENCE) };
}

/** Does the number look wrong for what the message says it is? */
export function registrationProblem(number: string, around: string): string | null {
  const m = /^in([a-z])(\d+)$/i.exec(number.replace(/[\s-]/g, ""));
  if (!m) return "shape";
  const letter = (m[1] ?? "").toLowerCase();
  const digits = m[2] ?? "";
  if (!VALID_THIRD_LETTER.has(letter)) return "letter";
  if (digits.length !== REG_DIGITS) return "length";
  for (const role of ROLE_TO_LETTERS) {
    if (role.say.test(around) && !role.letters.includes(letter)) return "role";
  }
  return null;
}

export function deriveFlags(facts: Fact[], texts: string[]): Flag[] {
  const flags: Flag[] = [];
  const live = facts.filter((f) => !f.ignored);

  // one fact, one rule
  for (const rule of ruleBook.rules) {
    if (!rule.fact) continue;
    const spans = spansOf(live, rule.fact);
    if (spans.length) flags.push(flag(rule.id, spans));
  }

  const claim = spansOf(live, "registered_claim");
  const regNumbers = live.filter((f) => f.kind === "registration_number");

  // R02: says it is SEBI registered, but shows no registration number at all
  if (claim.length && regNumbers.length === 0) flags.push(flag("R02", claim));

  // R03: a registration number that does not fit its shape or its role
  const badNumbers = regNumbers.filter((f) => {
    const text = texts[f.span.entry ?? 0] ?? "";
    const around = text.slice(Math.max(0, f.span.start - 120), f.span.end + 120);
    return registrationProblem(f.span.text, around) !== null;
  });
  if (badNumbers.length) flags.push(flag("R03", badNumbers.map((f) => f.span)));

  // R04 and R05 are about UPI ids and bank accounts
  const payAsk = spansOf(live, "payment_request");
  const bankAsk = spansOf(live, "bank_account");
  const upis = live.filter((f) => f.kind === "upi_id");
  const notValidated = upis.filter((f) => checkUpiId(f.span.text).shape !== "valid-shape");

  // R04: asked to pay a personal or third-party UPI id or account
  if (payAsk.length && notValidated.length) {
    flags.push(flag("R04", [...notValidated.map((f) => f.span), ...payAsk]));
  } else if (payAsk.length && bankAsk.length) {
    flags.push(flag("R04", [...bankAsk, ...payAsk]));
  }

  // R05: presents as a registered intermediary, but the UPI id is not a SEBI validated handle.
  // A handle that imitates @valid with a wrong suffix is flagged even without a claim.
  const presenting = claim.length > 0 || live.some((f) => f.kind === "official_impersonation");
  const imitation = upis.filter((f) => checkUpiId(f.span.text).shape === "bad-suffix");
  if (imitation.length) {
    flags.push(flag("R05", imitation.map((f) => f.span)));
  } else if (presenting && notValidated.length) {
    flags.push(flag("R05", [...notValidated.map((f) => f.span), ...claim]));
  }

  return flags.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
}
