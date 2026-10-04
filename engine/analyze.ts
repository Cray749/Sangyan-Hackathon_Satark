import { extractFacts } from "./extract";
import { applyContextGuard } from "./guard";
import { inferStage, stageSignals } from "./journey";
import type { StageSignal } from "./journey";
import { planActions } from "./planner";
import type { PaidAnswer, Plan } from "./planner";
import { redact } from "./redact";
import type { Redaction } from "./redact";
import { deriveFlags } from "./rules";
import { checkUpiId } from "./upi";
import type { UpiCheck } from "./upi";
import { decideVerdict } from "./verdict";
import type { Verdict } from "./verdict";
import type { Fact, Flag, Stage } from "./types";

// The whole pipeline in one place:
//   redact -> read -> context guard -> rules -> journey -> verdict -> plan
// Every step is a plain function with no network, so this runs in the browser, on the
// server and in the evaluation script, and we test the real thing.

export interface AnalyzeOptions {
  /** The stage already reached in this case. The marker never moves back by itself. */
  previousStage?: Stage | null;
  /** Set when the user says "no, I am actually at stage X". */
  userStage?: Stage | null;
  /**
   * Extra facts from the optional AI reader, one list per message. They must already have
   * passed the span check. The rule book still decides what they mean.
   */
  extraFacts?: Fact[][];
  /** The person's answer to "have you already paid?". */
  paid?: PaidAnswer;
}

export interface Analysis {
  texts: string[];
  /** What was hidden before reading, per message. */
  redactions: Redaction[][];
  facts: Fact[];
  flags: Flag[];
  signals: StageSignal[];
  stage: Stage | null;
  verdict: Verdict;
  plan: Plan;
  /** Every UPI id seen, with its shape check. Format only, never proof. */
  upi: UpiCheck[];
}

function overlaps(a: Fact, b: Fact): boolean {
  return a.kind === b.kind && a.span.start < b.span.end && a.span.end > b.span.start;
}

function factsForEntry(text: string, index: number, extra: Fact[]): { facts: Fact[]; redactions: Redaction[] } {
  const hidden = redact(text);
  // The mask keeps the same length, so positions found in the masked text are also valid
  // in the original text. We show the user's own words, not the masked ones.
  const rules = extractFacts(hidden.text);
  const merged = [...rules];
  for (const f of extra) if (!merged.some((m) => overlaps(m, f))) merged.push(f);

  const guarded = applyContextGuard(text, merged);
  const facts = guarded.map((f) => ({
    ...f,
    span: { ...f.span, text: text.slice(f.span.start, f.span.end), entry: index },
  }));
  return { facts, redactions: hidden.redactions };
}

export function analyze(texts: string[], options: AnalyzeOptions = {}): Analysis {
  const redactions: Redaction[][] = [];
  const facts: Fact[] = [];

  texts.forEach((text, i) => {
    const one = factsForEntry(text, i, options.extraFacts?.[i] ?? []);
    redactions.push(one.redactions);
    facts.push(...one.facts);
  });

  const flags = deriveFlags(facts, texts);
  const signals = stageSignals(flags, facts);
  const stage = inferStage(signals, options.previousStage ?? null, options.userStage ?? null);
  const verdict = decideVerdict(flags, facts, texts);
  const plan = planActions({ level: verdict.level, flags, facts, stage, paid: options.paid });

  const seen = new Set<string>();
  const upi: UpiCheck[] = [];
  for (const f of facts) {
    if (f.kind !== "upi_id" || f.ignored) continue;
    const key = f.span.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    upi.push(checkUpiId(f.span.text));
  }

  return { texts, redactions, facts, flags, signals, stage, verdict, plan, upi };
}
