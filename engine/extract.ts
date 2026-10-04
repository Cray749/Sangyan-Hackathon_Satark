import { mergedLexicon } from "../rulebook/lexicon";
import type { LexEntry } from "../rulebook/lexicon";
import { normalize, toOriginal } from "./normalize";
import type { Normalized } from "./normalize";
import type { Fact, FactKind } from "./types";
import { findUpiSpans } from "./upi";

// The rule reader. It is fast, it never leaves the device, and it is always on.
// It only POINTS at the user's words. It does not decide anything about the message.

// ---- negation: "never share your OTP" is advice, not a request -------------------------

// words just before the match that flip its meaning (English)
const NEG_BEFORE_EN =
  /\b(?:do\s*not|don'?t|never|should\s*not|must\s*not|shall\s*not|cannot|can'?t|won'?t|not|no|zero|without|nobody|no\s*one)\s+(?:[a-z']+\s+){0,3}$/;
// "kabhi", "kisi ko bhi" and the like (Hindi, Marathi, Hinglish) just before the match
const NEG_BEFORE_IN =
  /(?:कभी|कधीही|किसी\s*को|कोणालाही|कोणाला|kabhi|kisi\s*ko)\s*(?:भी\s*)?(?:\S+\s*){0,2}$/;
// "...न करें", "...नहीं", "...mat", "...नका" shortly after the match
const NEG_AFTER_IN =
  /^(?:\s*\S+){0,3}?\s+(?:न|ना|नहीं|नही|मत|नका|नाही|नये|nahi|nahin|mat|na)(?=\s|$|[.!?।,])/;

function isNegated(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 45), start);
  const after = text.slice(end, end + 45);
  return NEG_BEFORE_EN.test(before) || NEG_BEFORE_IN.test(before) || NEG_AFTER_IN.test(after);
}

// ---- sentences ---------------------------------------------------------------------

export interface Sentence {
  start: number;
  end: number;
}

/** Splits the cleaned text into sentences. "Rs. 500" may split early, which is fine. */
export function sentencesOf(text: string): Sentence[] {
  const out: Sentence[] = [];
  const cut = /(?<=[.!?।])\s+|\n+/g;
  let from = 0;
  for (const m of text.matchAll(cut)) {
    const at = m.index ?? 0;
    if (at > from) out.push({ start: from, end: at });
    from = at + m[0].length;
  }
  if (from < text.length) out.push({ start: from, end: text.length });
  return out;
}

function sentenceAt(sentences: Sentence[], pos: number): Sentence {
  return sentences.find((s) => pos >= s.start && pos < s.end) ?? { start: 0, end: 0 };
}

// ---- compiled patterns -------------------------------------------------------------

interface Compiled {
  kind: FactKind;
  re: RegExp;
  also?: RegExp;
  except?: RegExp;
  negatable: boolean;
}

// Hindi words are stored the way people type them, so we clean the patterns the same way as
// the text (same Unicode form, no nukta dot, one kind of nasal dot). We do NOT lower-case them: that would turn
// regex pieces like \S into \s.
const NUKTA = String.fromCharCode(0x093c);
const CHANDRABINDU = String.fromCharCode(0x0901);
const ANUSVARA = String.fromCharCode(0x0902);
const clean = (src: string) =>
  src.normalize("NFKC").split(NUKTA).join("").split(CHANDRABINDU).join(ANUSVARA);

let compiled: Compiled[] | null = null;

function patterns(): Compiled[] {
  if (compiled) return compiled;
  compiled = [];
  for (const [kind, entries] of mergedLexicon()) {
    for (const e of entries as LexEntry[]) {
      compiled.push({
        kind,
        re: new RegExp(clean(e.re), "g"),
        also: e.also ? new RegExp(clean(e.also)) : undefined,
        except: e.except ? new RegExp(clean(e.except)) : undefined,
        negatable: Boolean(e.negatable),
      });
    }
  }
  return compiled;
}

// ---- links and registration numbers (found by shape, not by words) ------------------

const LINK =
  /(?:https?:\/\/|www\.)[^\s<>"')]+|(?:t\.me|wa\.me|chat\.whatsapp\.com|bit\.ly|tinyurl\.com|cutt\.ly|rb\.gy)\/[^\s<>"')]+|(?<![@\w.-])[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|xyz|top|club|online|site|app|link|live|vip|shop|info|apk|co\.in|in)(?:\/[^\s<>"')]*)?(?![\w@])/g;

// links that are fine to see in a message: the regulators and the two official app stores
const OFFICIAL_HOST =
  /(?:^|\.)(?:sebi\.gov\.in|nseindia\.com|bseindia\.com|nsdl\.(?:co\.in|com)|cdslindia\.com|cdslipf\.com|cybercrime\.gov\.in|rbi\.org\.in|scores\.sebi\.gov\.in|play\.google\.com|apps\.apple\.com|[a-z0-9-]+\.gov\.in)(?:\/|$)/;

const APP_WORDS = /\b(?:app|apps|application|install|download)\b|ऐप|एप|ॲप|अॅप|डाउनलोड|इंस्टॉल|इन्स्टॉल/;

const REG_NUMBER = /\bin[a-z]\d{3,12}\b/g;

// ---- the reader ------------------------------------------------------------------------

function push(out: Fact[], n: Normalized, original: string, kind: FactKind, s: number, e: number) {
  const o = toOriginal(n, s, e);
  // the same kind of fact over the same words is only counted once
  if (out.some((f) => f.kind === kind && f.span.start < o.end && f.span.end > o.start)) return;
  out.push({
    kind,
    origin: "rules",
    span: { start: o.start, end: o.end, text: original.slice(o.start, o.end) },
  });
}

export function extractFacts(original: string): Fact[] {
  const n = normalize(original);
  const sentences = sentencesOf(n.text);
  const out: Fact[] = [];

  for (const p of patterns()) {
    p.re.lastIndex = 0;
    for (const m of n.text.matchAll(p.re)) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (end === start) continue;
      if (p.also) {
        // the ask often comes in the next sentence ("I am an officer. Share your login."),
        // so the second pattern may sit in this sentence or the one right after it
        const s = sentenceAt(sentences, start);
        const next = sentences.find((x) => x.start >= s.end);
        const until = next ? next.end : s.end;
        if (!p.also.test(n.text.slice(s.start, until))) continue;
      }
      if (p.except) {
        const s = sentenceAt(sentences, start);
        if (p.except.test(n.text.slice(s.start, s.end))) continue;
      }
      if (p.negatable && isNegated(n.text, start, end)) continue;
      push(out, n, original, p.kind, start, end);
    }
  }

  for (const hit of findUpiSpans(n.text)) {
    push(out, n, original, "upi_id", hit.start, hit.end);
  }

  for (const m of n.text.matchAll(REG_NUMBER)) {
    const start = m.index ?? 0;
    push(out, n, original, "registration_number", start, start + m[0].length);
  }

  for (const m of n.text.matchAll(LINK)) {
    const start = m.index ?? 0;
    const link = m[0].replace(/[.,;:!?]+$/, "");
    const host = link.replace(/^https?:\/\//, "").replace(/^www\./, "");
    if (OFFICIAL_HOST.test(host)) continue;
    push(out, n, original, "link", start, start + link.length);
    const s = sentenceAt(sentences, start);
    if (APP_WORDS.test(n.text.slice(s.start, s.end))) {
      push(out, n, original, "off_store_app", start, start + link.length);
    }
  }

  return out.sort((a, b) => a.span.start - b.span.start);
}
