import { nextStage } from "./journey";
import type { LinkKey } from "./links";
import type { Fact, Flag, RuleId, Stage, VerdictLevel } from "./types";

// The action planner. It picks the one safe thing to do now, the next step of the script,
// and WHERE to complain. It only returns keys. The words come from the i18n templates, so
// every sentence a person reads has been written and checked by a human.

export type ActionKey =
  | "pause"
  | "dont_pay"
  | "dont_click"
  | "dont_install"
  | "dont_share_credentials"
  | "dont_borrow"
  | "no_recovery_fee"
  | "tell_family"
  | "verify_sebi_check"
  | "open_official_app"
  | "check_registration"
  | "save_evidence"
  | "call_1930"
  | "tell_bank"
  | "report_cybercrime"
  | "change_password"
  | "contact_broker_dp";

/**
 * Where to complain. The routes follow SEBI's own SCORES FAQ: SCORES does not take
 * complaints about unregistered or unregulated activity, so those go to 1930 instead.
 */
export type RouteKey =
  | "money_sent" // call 1930, tell the bank, cybercrime.gov.in
  | "unregistered" // fake app or group: 1930 and cybercrime.gov.in, NOT SCORES
  | "registered" // a real broker, DP or fund: their grievance team, then SCORES
  | "credentials" // login or password shared
  | "recovery"; // fake officer or lawyer asking a fee to recover money

/** What the person told us when we asked "have you already sent money to them?" */
export type PaidAnswer = "yes" | "no" | null;

export interface Plan {
  /** True when money has moved, so the screen switches to Emergency Mode. */
  emergency: boolean;
  /**
   * True when the story is late (stage 6 or later) but nothing says money moved and the
   * person has not answered yet. The screen asks "have you already paid?" first.
   */
  askPaid: boolean;
  /** The stage whose "what happens next" card to show. */
  nextStage: Stage | null;
  /** The few things to do now, most important first. */
  actions: ActionKey[];
  routes: RouteKey[];
  /** Whether to offer the one-tap alert to a trusted person. */
  offerFamilyAlert: boolean;
  /** Official pages to show as buttons. */
  links: LinkKey[];
}

const has = (flags: Flag[], id: RuleId) => flags.some((f) => f.ruleId === id);

function add<T>(list: T[], item: T) {
  if (!list.includes(item)) list.push(item);
}

export function planActions(input: {
  level: VerdictLevel;
  flags: Flag[];
  facts: Fact[];
  stage: Stage | null;
  /** The answer to "have you already paid?". "yes" opens Emergency Mode even if the words never said so. */
  paid?: PaidAnswer;
}): Plan {
  const { level, flags, facts, stage } = input;
  const moneySent = input.paid === "yes" || facts.some((f) => f.kind === "money_sent" && !f.ignored);
  const grievance = facts.some((f) => f.kind === "registered_entity_grievance" && !f.ignored);

  // Emergency Mode is for money that has moved. A late stage on its own is not proof:
  // the person may only have been asked for the fee, so we ask them first.
  // Money paid in while the app still shows profit (stages 1 to 4) is not yet a loss to
  // report, so only their own "yes" opens Emergency Mode there.
  const midScam = stage !== null && stage >= 1 && stage <= 4;
  const emergency = input.paid === "yes" || (moneySent && !midScam);
  const askPaid = !emergency && input.paid !== "no" && stage !== null && stage >= 6;

  const actions: ActionKey[] = [];
  const routes: RouteKey[] = [];
  const links: LinkKey[] = [];

  if (emergency) {
    add(actions, "dont_pay");
    add(actions, "call_1930");
    add(actions, "tell_bank");
    add(actions, "save_evidence");
    add(actions, "report_cybercrime");
    add(routes, "money_sent");
    add(links, "cybercrime");
  } else if (level === "stop") {
    add(actions, "dont_pay");
    add(actions, "pause");
  } else if (level === "high") {
    add(actions, "pause");
    add(actions, "dont_pay");
  } else if (level === "cannot_verify") {
    add(actions, "pause");
    add(actions, "verify_sebi_check");
  } else {
    add(actions, "open_official_app");
    add(actions, "dont_click");
  }

  // things tied to the particular red flags
  if (has(flags, "R06")) {
    add(actions, "dont_share_credentials");
    add(actions, "change_password");
    add(actions, "contact_broker_dp");
    add(routes, "credentials");
  }
  if (has(flags, "R09")) add(actions, "dont_install");
  if (has(flags, "R04") || has(flags, "R05")) {
    add(actions, "verify_sebi_check");
    add(links, "sebiCheck");
  }
  if (has(flags, "R02") || has(flags, "R03")) {
    add(actions, "check_registration");
    add(links, "sebiIntermediaries");
  }
  if (has(flags, "R16")) add(actions, "dont_borrow");
  if (has(flags, "R13") || has(flags, "R14") || (stage !== null && stage >= 7)) {
    add(actions, "no_recovery_fee");
  }
  if (has(flags, "R13")) {
    add(routes, "recovery");
    add(actions, "report_cybercrime");
    add(links, "cybercrime");
  }

  const looksLikeScam = level === "stop" || level === "high" || flags.length > 0;
  if (looksLikeScam) {
    add(routes, "unregistered");
    add(links, "cybercrime");
    add(links, "sebiApps");
    add(links, "marketIntel");
  }

  // A real broker, DP or fund that treated someone badly is the case SCORES is built for.
  if (grievance && !looksLikeScam) {
    add(routes, "registered");
    add(links, "scores");
  }

  // Where it helps, send them to the official check. We never send them anywhere else.
  if (level === "cannot_verify" || level === "no_flags") add(links, "sebiCheck");
  if (level === "no_flags" || level === "cannot_verify") add(links, "sebiIntermediaries");

  return {
    emergency,
    askPaid,
    nextStage: stage ? nextStage(stage) : null,
    actions,
    routes,
    offerFamilyAlert: level === "stop" || level === "high" || emergency || askPaid,
    links: [...new Set(links)],
  };
}
