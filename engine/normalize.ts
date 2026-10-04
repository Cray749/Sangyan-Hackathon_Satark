// Scam messages are messy: fancy fonts, full-width letters, Devanagari digits, hidden
// zero-width characters. We clean the text up before matching, but we remember where every
// cleaned character came from, so we can still point at the user's original words.

export interface Normalized {
  /** Lower case, plain letters and digits, no hidden characters. */
  text: string;
  /** For each character of `text`, the index in the original where it started. */
  from: number[];
  /** For each character of `text`, the index in the original just after it ended. */
  to: number[];
}

// the Hindi nukta dot (U+093C) is dropped too, so "मुनाफ़ा" and "मुनाफा" match the same way
const HIDDEN = /[\u200b-\u200f\u2060\ufeff\u00ad\u093c]/;
const DEVANAGARI_ZERO = 0x0966;

function plainChar(ch: string): string {
  if (ch === "\u2019" || ch === "\u2018") return "'";
  const code = ch.codePointAt(0) ?? 0;
  if (code >= DEVANAGARI_ZERO && code <= DEVANAGARI_ZERO + 9) {
    return String(code - DEVANAGARI_ZERO);
  }
  return ch;
}

export function normalize(original: string): Normalized {
  let text = "";
  const from: number[] = [];
  const to: number[] = [];

  let i = 0;
  for (const ch of original) {
    const width = ch.length; // 2 for emoji and fancy letters
    if (!HIDDEN.test(ch)) {
      const cleaned = plainChar(ch).normalize("NFKC").toLowerCase();
      for (const c of cleaned) {
        text += c;
        for (let k = 0; k < c.length; k++) {
          from.push(i);
          to.push(i + width);
        }
      }
    }
    i += width;
  }
  return { text, from, to };
}

/** Turns a start and end in the cleaned text into a start and end in the original text. */
export function toOriginal(n: Normalized, start: number, end: number): { start: number; end: number } {
  const first = n.from[start] ?? 0;
  const last = n.to[Math.max(end - 1, start)] ?? first;
  return { start: first, end: Math.max(last, first) };
}
