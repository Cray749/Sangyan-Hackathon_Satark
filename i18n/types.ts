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
  /** Page titles and descriptions for the browser tab, link previews and screen readers. */
  meta: Record<"home" | "rules" | "trust" | "radar" | "about", { title: string; description: string }>;

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
    scan: string;
    scanStop: string;
    scanHelp: string;
    scanUnsupported: string;
    scanNothing: string;
    /** Uses {name}. */
    scanName: string;
    reg: Record<"valid-shape" | "wrong-length" | "unknown-letter" | "malformed", { title: string; body: string }>;
    /** Uses {role}. */
    regRole: string;
    regOtherRole: string;
    regOpen: string;
    regPlaceholder: string;
  };

  app: {
    storyTitle: string;
    storyBody: string;
    composerTitle: string;
    composerHint: string;
    placeholder: string;
    check: string;
    addMore: string;
    mic: string;
    micStop: string;
    listening: string;
    micUnsupported: string;
    examplesTitle: string;
    privacyNote: string;
    /** Uses {n}. */
    hidden: string;
    paid: string;
    paidBack: string;
    askPaidTitle: string;
    askPaidHint: string;
    askPaidYes: string;
    askPaidNo: string;
    secondScam: string;
    readAloud: string;
    stopReading: string;
    caseTitle: string;
    /** Uses {n}. */
    message: string;
    newCase: string;
    newCaseConfirm: string;
    stageFixLabel: string;
    stageFixHint: string;
    /** Uses {n}. */
    flagCount: string;
    footer: string;
    textSize: string;
    nav: { check: string; rules: string; trust: string; radar: string; about: string };
    /** Heading of the footer links for regulators and reviewers. */
    forReviewers: string;
  };

  ai: {
    toggleLabel: string;
    toggleBody: string;
    working: string;
    /** Uses {n}. */
    added: string;
    none: string;
    screenshot: string;
    screenshotNote: string;
    screenshotNeedsAi: string;
    screenshotReading: string;
    screenshotFailed: string;
    badge: string;
  };

  radar: {
    title: string;
    intro: string;
    sampleBanner: string;
    download: string;
    /** Uses {n}. */
    liveBanner: string;
    consentTitle: string;
    consentBody: string;
    consentLabel: string;
    typesTitle: string;
    types: Record<
      "fake_app_group" | "credential_theft" | "withdrawal_fee" | "recovery_scam" | "tip_hype" | "registration_claim" | "institutional_offer" | "other",
      string
    >;
    languageTitle: string;
    stageTitle: string;
    stageNote: string;
    unclear: string;
    /** Uses {n}. */
    hiddenNote: string;
    total: string;
    notesTitle: string;
    notes: string[];
  };

  trust: {
    title: string;
    intro: string;
    setTitle: string;
    /** Uses {n} and {version}. */
    setBody: string;
    metricsTitle: string;
    metrics: {
      catch: string;
      early: string;
      falseAlarm: string;
      cleared: string;
      emergency: string;
      askPaid: string;
      emergencyFalse: string;
      stage: string;
      stageOne: string;
      cannot: string;
      decided: string;
    };
    /** Uses {n}, {low}, {high}. */
    range: string;
    stopOfCaught: string;
    heldoutTitle: string;
    /** Uses {n}. */
    heldoutBody: string;
    heldoutNone: string;
    compareTitle: string;
    compareBody: string;
    keyword: string;
    ours: string;
    promisesTitle: string;
    neverSafe: string;
    /** Uses {n}. */
    injection: string;
    languagesTitle: string;
    langNames: { en: string; hi: string; hinglish: string; mr: string };
    adversarialTitle: string;
    /** Uses {n}. */
    adversarialBody: string;
    limitsTitle: string;
    limits: string[];
    missedTitle: string;
    updated: string;
  };

  about: {
    title: string;
    intro: string;
    rowsTitle: string;
    rows: { rule: string; how: string }[];
    promisesTitle: string;
    promises: string[];
    limitsTitle: string;
    limits: string[];
  };

  ui: {
    severity: { S: string; H: string; M: string };
    legend: { title: string; S: string; H: string; M: string; combine: string };
    neverSafe: string;
    disclaimer: string;
    predictNote: string;
    why: string;
    whyTitle: string;
    sourceLabel: string;
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
