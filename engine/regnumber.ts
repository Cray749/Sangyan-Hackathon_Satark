import reg from "../rulebook/reg-numbers.json";

// Pre-Pay Check for a SEBI registration number such as INA000012345.
// Like the UPI check, this looks at the SHAPE only. A number that looks right can still be
// copied from someone else, so every result sends the person to the SEBI list.

export type RegShape = "valid-shape" | "wrong-length" | "unknown-letter" | "malformed";

export interface RegCheck {
  input: string;
  shape: RegShape;
  /** What the third letter says, when we know it (for example "Research analyst"). */
  role?: string;
  /** The third letter, upper case. */
  letter?: string;
  formatOnly: true;
  checkUrl: string;
}

const ROLES = reg.roles as Record<string, string>;
const OTHER = new Set(reg.otherLetters);

export function looksLikeRegNumber(raw: string): boolean {
  return /^\s*in[a-z][\s-]?\d/i.test(raw);
}

export function checkRegNumber(raw: string): RegCheck {
  const input = raw.trim();
  const base = { input, formatOnly: true as const, checkUrl: reg.source };
  const m = /^in([a-z])(\d+)$/i.exec(input.replace(/[\s-]/g, ""));
  if (!m) return { ...base, shape: "malformed" };

  const letter = (m[1] ?? "").toLowerCase();
  const digits = m[2] ?? "";
  const known = letter in ROLES;
  if (!known && !OTHER.has(letter)) return { ...base, shape: "unknown-letter", letter: letter.toUpperCase() };
  if (digits.length !== reg.digits) return { ...base, shape: "wrong-length", letter: letter.toUpperCase(), role: ROLES[letter] };
  return { ...base, shape: "valid-shape", letter: letter.toUpperCase(), role: ROLES[letter] };
}
