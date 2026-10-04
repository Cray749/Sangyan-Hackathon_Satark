// The shapes shared by every part of the engine. Nothing in here touches the network.

export type Lang = "en" | "hi" | "mr";

/** The scam journey. 1 to 7 are SEBI's own stages, 8 is our recovery-scam stage. */
export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** S can cause STOP alone, H is high, M is medium. */
export type Severity = "S" | "H" | "M";

export type RuleId =
  | "R01" | "R02" | "R03" | "R04" | "R05" | "R06"
  | "R07" | "R08" | "R09" | "R10" | "R11" | "R12"
  | "R13" | "R14" | "R15" | "R16" | "R17" | "R18";

/**
 * Facts are small things we can point at in the user's own words.
 * Some map straight to one rule, some are only clues for the journey.
 */
export type FactKind =
  // straight from the words in the message
  | "assured_returns" // R01
  | "credential_request" // R06
  | "institutional_offer" // R07
  | "withdraw_fee" // R08
  | "off_store_app" // R09
  | "vip_group" // R10
  | "urgency_secrecy" // R11
  | "profit_proof" // R12
  | "refund_fee" // R13
  | "official_impersonation" // R14
  | "celebrity_endorsement" // R15
  | "invest_more" // R16
  | "hype_words" // R17
  | "fake_cert_or_course" // R18
  // clues the rules combine (R02, R03, R04, R05 are worked out from these)
  | "registered_claim"
  | "registration_number"
  | "payment_request"
  | "upi_id"
  // clues for the journey and the emergency plan
  | "fake_profit_shown"
  | "app_blocked_or_gone"
  | "money_sent"
  | "registered_entity_grievance"
  // used by the context guard
  | "warning_cue";

export interface Span {
  start: number;
  end: number;
  /** The exact words from the user's text. The AI reader must also give us this. */
  text: string;
}

export interface Fact {
  kind: FactKind;
  span: Span;
  origin: "rules" | "ai";
  /** Set when the context guard decided the words were a warning, not an offer. */
  ignored?: "warning-context";
}

export interface Flag {
  ruleId: RuleId;
  severity: Severity;
  evidence: Span[];
}

export type VerdictLevel = "stop" | "high" | "cannot_verify" | "no_flags";

export interface RuleSource {
  label: string;
  url: string;
}

export interface Rule {
  id: RuleId;
  severity: Severity;
  /** Which fact switches this rule on. R02 to R05 are worked out in code, so they have none. */
  fact: FactKind | null;
  /** Which stage of the journey this red flag usually belongs to. */
  stage: Stage | null;
  /** P = official document opened and read by us, T = trusted outlet, to be replaced. */
  status: "P" | "T";
  sources: RuleSource[];
}

export interface RuleBook {
  version: string;
  lastReviewed: string;
  rules: Rule[];
}
