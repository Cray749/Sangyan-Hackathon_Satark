import { analyze } from "../engine/analyze";
import { guardOutput } from "../engine/guardrails";
import { messages } from "../i18n";
import type { Lang, VerdictLevel } from "../engine/types";
import { keywordFilter } from "./baselines";
import type { Item, Style } from "./types";

// Measures Satark on the labelled set. We report every number, good or bad.

export interface Outcome {
  item: Item;
  level: VerdictLevel;
  stage: number | null;
  emergency: boolean;
  askPaid: boolean;
  /** Did the verdict do what was expected of this item? null if nothing was expected. */
  ok: boolean | null;
  baselineFlagged: boolean;
}

const LEVEL_LANG: Record<Style, Lang> = { en: "en", hi: "hi", hinglish: "hi", mr: "mr" };

export function runItem(item: Item): Outcome {
  const a = analyze([item.text]);
  const level = a.verdict.level;
  const catches = level === "stop" || level === "high";

  let ok: boolean | null = null;
  if (item.expect === "catch") ok = catches;
  else if (item.expect === "flag") ok = level !== "no_flags";
  else if (item.expect === "clear") ok = !catches;
  else if (item.expect === "emergency") ok = a.plan.emergency;
  else if (item.expect === "ask_paid") ok = a.plan.askPaid && !a.plan.emergency;

  return {
    item,
    level,
    stage: a.stage,
    emergency: a.plan.emergency,
    askPaid: a.plan.askPaid,
    ok,
    baselineFlagged: keywordFilter(item.text),
  };
}

const pct = (n: number, d: number) => (d === 0 ? null : Math.round((n / d) * 1000) / 10);

export interface Group {
  n: number;
  /** Percent of scam messages we stopped or marked high risk. */
  catchRate: number | null;
  /** Percent of scam messages at stage 1 to 3 that we caught. */
  earlyCatchRate: number | null;
  /** Percent of scam messages we called NO RED FLAGS FOUND. The worst mistake. */
  scamClearedRate: number | null;
  /** Percent of weak-signal scam messages that were at least not cleared. */
  weakSignalNotCleared: number | null;
  /** Percent of genuine and clear-expected messages we wrongly scared people with. */
  falseAlarmRate: number | null;
  /** Percent of victims who said they lost money, where Emergency Mode opened. */
  emergencyRate: number | null;
  /** Percent of late-stage stories with no payment stated, where we asked "have you paid?". */
  askPaidRate: number | null;
  /** Percent of messages with no payment stated, where Emergency Mode opened anyway. */
  emergencyFalseRate: number | null;
  /** Percent where the stage matched exactly, among items that have a stage. */
  stageExact: number | null;
  /** Percent where the stage was within one step. */
  stageWithinOne: number | null;
}

export function summarize(outcomes: Outcome[]): Group {
  const scams = outcomes.filter((o) => o.item.expect === "catch");
  const weak = outcomes.filter((o) => o.item.expect === "flag");
  const everyScam = outcomes.filter((o) => o.item.kind === "scam_msg");
  const early = scams.filter((o) => o.item.stage !== null && o.item.stage <= 3);
  const clears = outcomes.filter((o) => o.item.expect === "clear");
  const emerg = outcomes.filter((o) => o.item.expect === "emergency");
  const asks = outcomes.filter((o) => o.item.expect === "ask_paid");
  const noPayment = outcomes.filter((o) => o.item.expect !== "emergency");
  const staged = outcomes.filter((o) => o.item.stage !== null);

  return {
    n: outcomes.length,
    catchRate: pct(scams.filter((o) => o.ok).length, scams.length),
    earlyCatchRate: pct(early.filter((o) => o.ok).length, early.length),
    scamClearedRate: pct(everyScam.filter((o) => o.level === "no_flags").length, everyScam.length),
    weakSignalNotCleared: pct(weak.filter((o) => o.ok).length, weak.length),
    falseAlarmRate: pct(clears.filter((o) => !o.ok).length, clears.length),
    emergencyRate: pct(emerg.filter((o) => o.ok).length, emerg.length),
    askPaidRate: pct(asks.filter((o) => o.ok).length, asks.length),
    emergencyFalseRate: pct(noPayment.filter((o) => o.emergency).length, noPayment.length),
    stageExact: pct(staged.filter((o) => o.stage === o.item.stage).length, staged.length),
    stageWithinOne: pct(
      staged.filter((o) => o.stage !== null && Math.abs(o.stage - (o.item.stage as number)) <= 1).length,
      staged.length,
    ),
  };
}

export interface Report {
  generatedAt: string;
  ruleBookVersion: string;
  total: number;
  overall: Group;
  byStyle: Record<Style, Group>;
  /** How often we said CANNOT VERIFY, and how right we were when we did decide. */
  honesty: { cannotVerifyRate: number | null; decidedAccuracy: number | null };
  baseline: { catchRate: number | null; falseAlarmRate: number | null };
  promises: {
    /** Answers that said safe or were not one of the four levels. Must be 0. */
    neverSafeViolations: number;
    /** Tricks that made a scam message score LOWER than the same message without the trick. Must be 0. */
    injectionLowered: number;
    injectionTried: number;
  };
  adversarial: { n: number; catchRate: number | null; falseAlarmRate: number | null; missed: string[] };
  /** Known misses, so the page can show the weak spots honestly. */
  missedScams: { id: string; style: Style; text: string; level: VerdictLevel }[];
  falseAlarms: { id: string; style: Style; text: string; level: VerdictLevel }[];
  aiComparison: { status: "not-run"; note: string };
}

const LEVELS: VerdictLevel[] = ["stop", "high", "cannot_verify", "no_flags"];
const RANK: Record<VerdictLevel, number> = { stop: 3, high: 2, cannot_verify: 1, no_flags: 0 };

export function buildReport(main: Item[], adv: Item[], ruleBookVersion: string): Report {
  const outcomes = main.map(runItem);
  const advOutcomes = adv.map(runItem);

  const styles: Style[] = ["en", "hi", "hinglish", "mr"];
  const byStyle = Object.fromEntries(styles.map((s) => [s, summarize(outcomes.filter((o) => o.item.style === s))])) as Record<Style, Group>;

  // honesty about doubt
  const cannot = outcomes.filter((o) => o.level === "cannot_verify");
  const decided = outcomes.filter((o) => o.level !== "cannot_verify" && o.ok !== null);

  // baseline on the same items
  const scams = outcomes.filter((o) => o.item.expect === "catch");
  const clears = outcomes.filter((o) => o.item.expect === "clear");

  // never say safe: look at every word we could ever show for every outcome
  let violations = 0;
  for (const o of outcomes.concat(advOutcomes)) {
    if (!LEVELS.includes(o.level)) violations++;
    const t = messages(LEVEL_LANG[o.item.style]);
    const shown = [t.verdict[o.level].title, t.verdict[o.level].body];
    if (shown.some((s) => guardOutput(s).hits.some((h) => h.rule === "safe-claim"))) violations++;
  }

  // injection: the trick must never make the verdict softer
  const injected = adv.filter((i) => i.trick === "injection" && i.baseText);
  let lowered = 0;
  for (const i of injected) {
    const withTrick = analyze([i.text]).verdict.level;
    const plain = analyze([i.baseText as string]).verdict.level;
    if (RANK[withTrick] < RANK[plain]) lowered++;
  }

  const advScams = advOutcomes.filter((o) => o.item.expect === "catch");
  const advClears = advOutcomes.filter((o) => o.item.expect === "clear");

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    ruleBookVersion,
    total: main.length,
    overall: summarize(outcomes),
    byStyle,
    honesty: {
      cannotVerifyRate: pct(cannot.length, outcomes.length),
      decidedAccuracy: pct(decided.filter((o) => o.ok).length, decided.length),
    },
    baseline: {
      catchRate: pct(scams.filter((o) => o.baselineFlagged).length, scams.length),
      falseAlarmRate: pct(clears.filter((o) => o.baselineFlagged).length, clears.length),
    },
    promises: { neverSafeViolations: violations, injectionLowered: lowered, injectionTried: injected.length },
    adversarial: {
      n: adv.length,
      catchRate: pct(advScams.filter((o) => o.ok).length, advScams.length),
      falseAlarmRate: pct(advClears.filter((o) => !o.ok).length, advClears.length),
      missed: advScams.filter((o) => !o.ok).map((o) => `${o.item.trick}: ${o.item.text.slice(0, 60)}`),
    },
    missedScams: scams
      .filter((o) => !o.ok)
      .slice(0, 25)
      .map((o) => ({ id: o.item.id, style: o.item.style, text: o.item.text, level: o.level })),
    falseAlarms: clears
      .filter((o) => !o.ok)
      .slice(0, 25)
      .map((o) => ({ id: o.item.id, style: o.item.style, text: o.item.text, level: o.level })),
    aiComparison: {
      status: "not-run",
      note: "The AI-on comparison needs a Gemini key. The rule engine above runs with the AI switched off, which is how CI runs it.",
    },
  };
}
