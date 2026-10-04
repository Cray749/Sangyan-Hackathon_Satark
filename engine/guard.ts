import { sentencesOf } from "./extract";
import type { Fact, FactKind } from "./types";

// Context guard. A post that WARNS about "guaranteed returns" is not a post that SELLS them.
// If a sentence is clearly a warning, red-flag words inside it are set aside.
//
// A scammer could try to hide behind this, so the guard switches itself off when the message
// also contains a live ask: a payment request, a UPI id, a bank account, or an outside link.

// Clues about the user's own story. These are never set aside.
const STORY_CLUES: FactKind[] = [
  "warning_cue",
  "money_sent",
  "app_blocked_or_gone",
  "fake_profit_shown",
  "registered_entity_grievance",
];

// If any of these is present, nobody is just "warning". Someone is asking for something.
const LIVE_ASKS: FactKind[] = ["payment_request", "upi_id", "bank_account", "link", "off_store_app"];

const QUOTE = /["\u201c\u00ab][^"\u201d\u00bb]{3,200}["\u201d\u00bb]/g;

export function applyContextGuard(text: string, facts: Fact[]): Fact[] {
  const cues = facts.filter((f) => f.kind === "warning_cue");
  if (cues.length === 0) return facts;
  if (facts.some((f) => LIVE_ASKS.includes(f.kind))) return facts;

  const sentences = sentencesOf(text);
  const warned = sentences.filter((s) => cues.some((c) => c.span.start >= s.start && c.span.start < s.end));
  const quoted = [...text.matchAll(QUOTE)].map((m) => ({
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));

  const inside = (f: Fact, ranges: { start: number; end: number }[]) =>
    ranges.some((r) => f.span.start >= r.start && f.span.end <= r.end);

  return facts.map((f) => {
    if (STORY_CLUES.includes(f.kind)) return f;
    if (inside(f, warned) || inside(f, quoted)) return { ...f, ignored: "warning-context" as const };
    return f;
  });
}
