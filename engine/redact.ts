import { normalize, toOriginal } from "./normalize";
import { findUpiSpans } from "./upi";

// Step 1 of the pipeline. Before anything else reads the text, we hide the private numbers.
// The mask is the SAME LENGTH as what it hides, so every position in the text stays valid
// and we can still highlight the user's original words later.

export type RedactionKind = "phone" | "aadhaar" | "pan" | "account" | "otp" | "email";

export interface Redaction {
  kind: RedactionKind;
  start: number;
  end: number;
}

export interface Redacted {
  text: string;
  redactions: Redaction[];
}

// Each pattern runs on the cleaned text (plain digits, lower case). Order matters:
// the first pattern to claim some characters keeps them.
const PATTERNS: { kind: RedactionKind; re: RegExp; group?: number }[] = [
  // "otp is 482913", "कोड 1234". Only the digits are hidden, the word stays for context.
  { kind: "otp", re: /(?:otp|one time password|verification code|code|कोड|ओटीपी|पासवर्ड)\D{0,20}?(\d{4,8})(?!\d)/g, group: 1 },
  { kind: "email", re: /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/g },
  { kind: "pan", re: /(?<![a-z0-9])[a-z]{5}\d{4}[a-z](?![a-z0-9])/g },
  { kind: "aadhaar", re: /(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g },
  { kind: "phone", re: /(?<!\d)(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g },
  { kind: "account", re: /(?<!\d)\d{9,18}(?!\d)/g },
];

export function redact(original: string): Redacted {
  const n = normalize(original);

  // never hide a UPI id: the engine needs it, and it belongs to the person asking for money
  const keep = findUpiSpans(n.text).map((h) => [h.start, h.end] as const);
  const inKeep = (s: number, e: number) => keep.some(([ks, ke]) => s < ke && e > ks);

  const taken: Redaction[] = [];
  const overlaps = (s: number, e: number) => taken.some((t) => s < t.end && e > t.start);

  for (const { kind, re, group } of PATTERNS) {
    for (const m of n.text.matchAll(re)) {
      let s = m.index ?? 0;
      const e = s + m[0].length;
      if (group) {
        const inner = m[group] ?? "";
        s = e - inner.length;
      }
      if (inKeep(s, e)) continue;
      const o = toOriginal(n, s, e);
      if (overlaps(o.start, o.end)) continue;
      taken.push({ kind, start: o.start, end: o.end });
    }
  }

  taken.sort((a, b) => a.start - b.start);

  let text = "";
  let at = 0;
  for (const r of taken) {
    text += original.slice(at, r.start);
    text += original.slice(r.start, r.end).replace(/\S/g, "X");
    at = r.end;
  }
  text += original.slice(at);

  return { text, redactions: taken };
}
