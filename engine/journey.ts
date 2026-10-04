import { getRule } from "./rulebook";
import type { Fact, FactKind, Flag, RuleId, Stage } from "./types";

// The scam journey. Stages 1 to 7 are SEBI's own stages for the fake trading app scam.
// Stage 8 (the "recovery" second scam) is our addition.

export const STAGES: Stage[] = [1, 2, 3, 4, 5, 6, 7, 8];

export interface StageSignal {
  stage: Stage;
  /** The rule or clue that pointed at this stage, so the app can explain itself. */
  because: RuleId | FactKind;
}

// Clues from the user's own story that are not rules, but tell us where they are.
const CLUE_STAGES: Partial<Record<FactKind, Stage>> = {
  fake_profit_shown: 4, // "my app shows profit", "the first small withdrawal worked"
  app_blocked_or_gone: 7, // "the app closed", "they blocked me"
};

export function stageSignals(flags: Flag[], facts: Fact[]): StageSignal[] {
  const out: StageSignal[] = [];
  for (const flag of flags) {
    const stage = getRule(flag.ruleId).stage;
    if (stage) out.push({ stage, because: flag.ruleId });
  }
  for (const kind of Object.keys(CLUE_STAGES) as FactKind[]) {
    const stage = CLUE_STAGES[kind];
    if (stage && facts.some((f) => f.kind === kind && !f.ignored)) {
      out.push({ stage, because: kind });
    }
  }
  return out;
}

/**
 * Where is the user now? The marker only moves forward as more evidence comes in.
 * The one way back is the user correcting us ("userStage"), and new evidence can still
 * move it forward again from there.
 */
export function inferStage(
  signals: StageSignal[],
  previous: Stage | null = null,
  userStage: Stage | null = null,
): Stage | null {
  const seen = signals.map((s) => s.stage);
  const floor = userStage ?? previous;
  const all = floor ? [...seen, floor] : seen;
  if (all.length === 0) return null;
  return Math.max(...all) as Stage;
}

/** The stage the scammer moves to next. After stage 6 the usual next move is 7, then 8. */
export function nextStage(stage: Stage): Stage | null {
  return stage < 8 ? ((stage + 1) as Stage) : null;
}

/** Money has probably moved by stage 4, so from there on the plan is about getting help. */
export function moneyAtRisk(stage: Stage | null): boolean {
  return stage !== null && stage >= 4;
}
