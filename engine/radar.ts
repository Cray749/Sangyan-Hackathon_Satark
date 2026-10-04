import type { Analysis } from "./analyze";
import type { Flag, Lang, RuleId, Stage, VerdictLevel } from "./types";

// Scam Radar events. They hold NO message text, no names, no numbers, no ids and no clock
// time finer than a day (the server adds the day). Only these four small facts:
//   what kind of scam, which language the person used, how far along they were when they
//   FIRST came to Satark, and how serious the answer was.
//
// "Stage at first contact" is the new measure for regulators: if most people only arrive
// at stage 5 or 6, awareness reached them too late.

export const SCAM_TYPES = [
  "fake_app_group",
  "credential_theft",
  "withdrawal_fee",
  "recovery_scam",
  "tip_hype",
  "registration_claim",
  "institutional_offer",
  "other",
] as const;

export type ScamType = (typeof SCAM_TYPES)[number];

export interface RadarEvent {
  scamType: ScamType;
  lang: Lang;
  /** The stage when the person first came to us, or 0 if it was not clear. */
  stage: Stage | 0;
  level: VerdictLevel;
}

const has = (flags: Flag[], ...ids: RuleId[]) => flags.some((f) => ids.includes(f.ruleId));

/** The one most telling kind of scam for a set of flags. The order matters. */
export function scamTypeOf(flags: Flag[]): ScamType {
  if (has(flags, "R13")) return "recovery_scam";
  if (has(flags, "R06", "R14")) return "credential_theft";
  if (has(flags, "R08")) return "withdrawal_fee";
  if (has(flags, "R09", "R10", "R04", "R16")) return "fake_app_group";
  if (has(flags, "R07")) return "institutional_offer";
  if (has(flags, "R02", "R03", "R05")) return "registration_claim";
  if (has(flags, "R17", "R12", "R15", "R01", "R18", "R11")) return "tip_hype";
  return "other";
}

/**
 * The event for a first check, or null when there is nothing worth counting
 * (no warning signs at all).
 */
export function radarEvent(a: Analysis, lang: Lang): RadarEvent | null {
  if (a.flags.length === 0) return null;
  return { scamType: scamTypeOf(a.flags), lang, stage: a.stage ?? 0, level: a.verdict.level };
}
