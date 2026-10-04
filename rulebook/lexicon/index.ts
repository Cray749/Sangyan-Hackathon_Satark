import type { FactKind } from "../../engine/types";
import { en } from "./en";
import { hi } from "./hi";
import type { LexEntry, Lexicon } from "./types";

export type { LexEntry, Lexicon } from "./types";

// Adding a language later means writing one more file like en.ts and listing it here.
const languages: Lexicon[] = [en, hi];

export function mergedLexicon(): Map<FactKind, LexEntry[]> {
  const all = new Map<FactKind, LexEntry[]>();
  for (const lex of languages) {
    for (const [kind, entries] of Object.entries(lex) as [FactKind, LexEntry[]][]) {
      all.set(kind, [...(all.get(kind) ?? []), ...entries]);
    }
  }
  return all;
}
