// Scam messages are messy: fancy fonts, full-width letters, Devanagari digits, hidden
// zero-width characters, emoji stuffed between words, Cyrillic letters that look like Latin
// ones, and words spaced out like "G U A R A N T E E D". We clean the text before matching,
// but we remember where every cleaned character came from, so we can still point at the
// user's original words.

export interface Normalized {
  /** Lower case, plain letters and digits, no hidden characters. */
  text: string;
  /** For each character of `text`, the index in the original where it started. */
  from: number[];
  /** For each character of `text`, the index in the original just after it ended. */
  to: number[];
}

const DEVANAGARI_ZERO = 0x0966;
const CHANDRABINDU = 0x0901;
const ANUSVARA = 0x0902;
const NUKTA = 0x093c; // the Hindi dot: "मुनाफ़ा" and "मुनाफा" should match the same way
const RIGHT_QUOTE = 0x2019;
const LEFT_QUOTE = 0x2018;

// characters nobody can see, dropped before matching (written as code points on purpose)
function isHidden(code: number): boolean {
  return (
    (code >= 0x200b && code <= 0x200f) || // zero-width spaces and joiners
    code === 0x2060 ||
    code === 0xfeff ||
    code === 0x00ad || // soft hyphen
    code === 0xfe0f || // emoji variation selector
    code === NUKTA
  );
}

// letters from other alphabets that look exactly like Latin ones
const LOOKALIKE: Record<number, string> = {
  0x0430: "a", 0x0435: "e", 0x043e: "o", 0x0440: "p", 0x0441: "c", 0x0445: "x", 0x0443: "y",
  0x0456: "i", 0x0455: "s", 0x0458: "j", 0x04bb: "h",
  0x0410: "a", 0x0412: "b", 0x0415: "e", 0x041a: "k", 0x041c: "m", 0x041d: "h", 0x041e: "o",
  0x0420: "p", 0x0421: "c", 0x0422: "t", 0x0425: "x",
  0x03bf: "o", 0x03b1: "a", 0x03bd: "v", 0x03c1: "p",
  0x0391: "a", 0x0392: "b", 0x0395: "e", 0x0399: "i", 0x039a: "k", 0x039c: "m", 0x039d: "n",
  0x039f: "o", 0x03a1: "p", 0x03a4: "t", 0x03a7: "x", 0x03a5: "y", 0x0396: "z",
};

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

function plainChar(ch: string): string {
  const code = ch.codePointAt(0) ?? 0;
  if (code === RIGHT_QUOTE || code === LEFT_QUOTE) return "'";
  // chandrabindu and anusvara are written both ways ("बताएँ" / "बताएं"), so make them one
  if (code === CHANDRABINDU) return String.fromCharCode(ANUSVARA);
  if (code >= DEVANAGARI_ZERO && code <= DEVANAGARI_ZERO + 9) return String(code - DEVANAGARI_ZERO);
  const twin = LOOKALIKE[code];
  if (twin) return twin;
  // an emoji between words ("returns 💰 every month") should act like a space
  if (PICTOGRAPH.test(ch)) return " ";
  return ch;
}

// "g u a r a n t e e d" or "g.u.a.r.a.n.t.e.e.d": at least five single letters in a row
const SPACED_LETTERS = /(?<![a-z0-9])(?:[a-z][ ._-]){4,}[a-z](?![a-z0-9])/g;

export function normalize(original: string): Normalized {
  let text = "";
  let from: number[] = [];
  let to: number[] = [];

  let i = 0;
  for (const ch of original) {
    const width = ch.length; // 2 for emoji and fancy letters
    if (!isHidden(ch.codePointAt(0) ?? 0)) {
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

  // close up spaced-out words, keeping the map back to the original text
  if (SPACED_LETTERS.test(text)) {
    SPACED_LETTERS.lastIndex = 0;
    const drop = new Set<number>();
    for (const m of text.matchAll(SPACED_LETTERS)) {
      const start = m.index ?? 0;
      for (let k = 0; k < m[0].length; k++) {
        if (!/[a-z]/.test(m[0].charAt(k))) drop.add(start + k);
      }
    }
    let squeezed = "";
    const nf: number[] = [];
    const nt: number[] = [];
    for (let k = 0; k < text.length; k++) {
      if (drop.has(k)) continue;
      squeezed += text.charAt(k);
      nf.push(from[k] as number);
      nt.push(to[k] as number);
    }
    text = squeezed;
    from = nf;
    to = nt;
  }
  SPACED_LETTERS.lastIndex = 0;

  return { text, from, to };
}

/** Turns a start and end in the cleaned text into a start and end in the original text. */
export function toOriginal(n: Normalized, start: number, end: number): { start: number; end: number } {
  const first = n.from[start] ?? 0;
  const last = n.to[Math.max(end - 1, start)] ?? first;
  return { start: first, end: Math.max(last, first) };
}
