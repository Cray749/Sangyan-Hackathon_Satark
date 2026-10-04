import type { ActionKey, RouteKey } from "../engine/planner";
import type { RuleId, Stage, VerdictLevel } from "../engine/types";
import type { UpiShape } from "../engine/upi";

// The shape every language file must follow. If a string is missing in Hindi or Marathi,
// the compiler stops us. Placeholders look like {this} and are filled in by render.ts.

export interface StageText {
  name: string;
  /** What Satark tells you if you are at this stage. */
  tell: string;
  /** What the scammer will do after this stage. Shown as "what happens next". */
  next: string;
}

export interface Messages {
  appName: string;
  tagline: string;

  verdict: Record<VerdictLevel, { title: string; body: string }>;
  stages: Record<Stage, StageText>;
  rules: Record<RuleId, { title: string; why: string }>;
  actions: Record<ActionKey, { title: string; detail: string }>;
  routes: Record<RouteKey, { title: string; why: string; steps: string[] }>;

  emergency: {
    title: string;
    intro: string;
    callButton: string;
    checklistTitle: string;
    checklist: string[];
    evidenceTitle: string;
    evidence: string[];
    scriptTitle: string;
    scriptHint: string;
    /** Uses {amount} {time} {utr} {payee} {bank}. Blank values become ____ */
    script: string;
    fields: { amount: string; time: string; utr: string; payee: string; bank: string };
    copy: string;
    copied: string;
    scoresNote: string;
  };

  family: {
    button: string;
    hint: string;
    /** Sent before any money moved. Uses {stage}. */
    early: string;
    /** Sent after money moved. */
    late: string;
  };

  prepay: {
    title: string;
    hint: string;
    placeholder: string;
    button: string;
    shape: Record<UpiShape, { title: string; body: string }>;
    role: string; // "The ending says: {role}"
    bankKnown: string;
    bankUnknown: string;
    formatOnly: string;
    thumbsUp: string;
    stepsTitle: string;
    steps: string[];
    open: string;
  };

  ui: {
    neverSafe: string;
    disclaimer: string;
    predictNote: string;
    why: string;
    whyTitle: string;
    sourceLabel: string;
    verified: string;
    trustedSource: string;
    stageLabel: string;
    stageUnknown: string;
    nowDo: string;
    nextTitle: string;
    nothingFound: string;
    evidenceLabel: string;
    ruleBookDate: string;
  };
}
