import type { Stage } from "../engine/types";

// What we test on. Every item is labelled when it is MADE, not after seeing what Satark says.

export type Style = "en" | "hi" | "hinglish" | "mr";

/**
 * scam_msg:     a message a scammer sends. We should catch it (STOP or HIGH RISK).
 * victim_story: a person describing what happened to them. We should find the stage,
 *               and open Emergency Mode once money has gone.
 * genuine:      a real-looking notice from a regulator, depository, bank or broker.
 *               We must not scare people with it.
 * hard:         warning posts, news, teaching posts, vague greetings, real registration numbers.
 */
export type Kind = "scam_msg" | "victim_story" | "genuine" | "hard";

/**
 * catch:     the verdict must be STOP or HIGH RISK
 * clear:     the verdict must NOT be STOP or HIGH RISK (no false alarm)
 * flag:      a weak signal on its own, so STOP is too much, but it must NOT be called clear
 *            (CANNOT VERIFY, HIGH RISK or STOP are all fine)
 * emergency: the words say money moved, so Emergency Mode must open
 * ask_paid:  late in the story, but nothing says money moved: Satark must ask "have you paid?"
 * either:    no verdict is expected, we only check stage and the never-safe promise
 */
export type Expect = "catch" | "flag" | "clear" | "emergency" | "ask_paid" | "either";

export interface Item {
  id: string;
  text: string;
  style: Style;
  kind: Kind;
  /** The stage a careful person would give this message, or null if it has no stage. */
  stage: Stage | null;
  expect: Expect;
  /** For the adversarial set: what the trick is. */
  trick?: string;
  /** For injection items: the same scam message WITHOUT the trick, to compare verdicts. */
  baseText?: string;
}
