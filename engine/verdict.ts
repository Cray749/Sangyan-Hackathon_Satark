import { hasMoneyContext, talksToChecker } from "./context";
import type { Fact, FactKind, Flag, VerdictLevel } from "./types";

// The verdict gate. It reads flags and nothing else.
//
// Three promises, all covered by tests:
//   1. There is no "safe" answer. The best one is "no red flags found".
//   2. This file never imports the AI reader. Rules decide.
//   3. A STOP rule can not be lowered by anything else in the message.
//
// How many flags make a STOP is OUR OWN choice, not a regulator's. It is written down in
// the README so anyone can argue with it.

export type VerdictReason =
  | "stop_rule" // at least one flag that can stop alone
  | "two_high" // two high flags
  | "high_and_medium" // one high flag with two or more medium ones
  | "one_high"
  | "two_medium"
  | "one_medium"
  | "live_ask" // something asks for money or details, but no rule matched
  | "too_little" // the text is too short to say anything
  | "off_topic" // nothing about money, investing or payments to judge
  | "talks_to_checker" // gives orders to the checker
  | "nothing_found";

export interface Verdict {
  level: VerdictLevel;
  reason: VerdictReason;
  counts: { S: number; H: number; M: number };
}

// If the message asks for money, details or a download, we do not call it clear.
const ASKS: FactKind[] = [
  "payment_request",
  "upi_id",
  "bank_account",
  "link",
  "off_store_app",
  "credential_request",
];

const MIN_WORDS = 6;

function wordCount(texts: string[]): number {
  return texts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function decideVerdict(flags: Flag[], facts: Fact[], texts: string[]): Verdict {
  const counts = { S: 0, H: 0, M: 0 };
  for (const f of flags) counts[f.severity] += 1;

  const make = (level: VerdictLevel, reason: VerdictReason): Verdict => ({ level, reason, counts });

  if (counts.S >= 1) return make("stop", "stop_rule");
  if (counts.H >= 2) return make("stop", "two_high");
  if (counts.H >= 1 && counts.M >= 2) return make("stop", "high_and_medium");
  if (counts.H === 1) return make("high", "one_high");
  if (counts.M >= 2) return make("high", "two_medium");
  if (counts.M === 1) return make("cannot_verify", "one_medium");

  // no flags at all: be careful before saying anything kind
  if (facts.some((f) => !f.ignored && ASKS.includes(f.kind))) return make("cannot_verify", "live_ask");
  if (wordCount(texts) < MIN_WORDS) return make("cannot_verify", "too_little");
  // "no red flags" is the best thing we say, so the text must at least be about money.
  // A text that gives orders to the checker never earns it.
  if (talksToChecker(texts)) return make("cannot_verify", "talks_to_checker");
  if (!hasMoneyContext(texts)) return make("cannot_verify", "off_topic");
  return make("no_flags", "nothing_found");
}
