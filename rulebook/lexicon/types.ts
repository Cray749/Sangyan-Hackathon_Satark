import type { FactKind } from "../../engine/types";

// One phrase pattern. We write them as plain regex text so a teammate who is not a coder
// can still read the file and add a new phrase.
export interface LexEntry {
  /** A regular expression. It runs on cleaned, lower-case text. */
  re: string;
  /**
   * A second pattern that must also appear in the same sentence.
   * Used where the first part alone is too common (for example "fee").
   */
  also?: string;
  /**
   * If this pattern also appears in the same sentence, the match is dropped.
   * "Never tell anyone your OTP" is advice, not the "keep it secret" red flag.
   */
  except?: string;
  /**
   * True when a nearby "do not", "never" or "no" means the message is saying the opposite.
   * "Returns are not guaranteed" must not be flagged as a guaranteed-returns promise.
   */
  negatable?: boolean;
}

export type Lexicon = Partial<Record<FactKind, LexEntry[]>>;
