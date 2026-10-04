import handles from "../rulebook/upi-handles.json";

// Rule R05. SEBI says registered intermediaries collect money on UPI IDs that look like
//   <name>.<suffix>@valid<bank>      for example  abc.brk@validhdfc
// This file only checks the SHAPE of an id. A good shape is not proof, the user must
// still confirm on SEBI Check.

export type UpiShape =
  | "valid-shape" // name.suffix@validbank
  | "bad-suffix" // @valid handle, but the suffix is not one of the ten
  | "not-valid-handle" // an ordinary UPI id, not a SEBI validated one
  | "malformed"; // not a UPI id at all

export interface UpiCheck {
  input: string;
  shape: UpiShape;
  /** What kind of intermediary the suffix says, e.g. "Stock broker". */
  role?: string;
  suffix?: string;
  /** The part after @, for example "validhdfc". */
  handle?: string;
  /** True only for handles printed in the circular itself. */
  bankConfirmed?: boolean;
  /** Set when the suffix looks like a typo of a real one (bkr -> brk). */
  didYouMean?: string;
  /** Always true. We never treat a format match as proof. */
  formatOnly: true;
  checkUrl: string;
}

const SUFFIXES = handles.suffixes as Record<string, string>;
const TYPOS = handles.commonTypos as Record<string, string>;
const CONFIRMED = new Set(handles.confirmedHandles);

const UPI_ID = /^[a-z0-9][a-z0-9._-]{0,60}@[a-z][a-z0-9]{1,30}$/;

export function checkUpiId(raw: string): UpiCheck {
  const input = raw.trim();
  const id = input.toLowerCase();
  const base = { input, formatOnly: true as const, checkUrl: handles.checkTool };

  if (!UPI_ID.test(id)) return { ...base, shape: "malformed" };

  const [user, handle] = id.split("@") as [string, string];
  if (!handle.startsWith(handles.handlePrefix) || handle === handles.handlePrefix) {
    return { ...base, shape: "not-valid-handle", handle };
  }

  // the suffix is whatever comes after the last dot in the user part
  const dot = user.lastIndexOf(".");
  const name = dot > 0 ? user.slice(0, dot) : "";
  const suffix = dot > 0 ? user.slice(dot + 1) : "";

  if (name && suffix in SUFFIXES) {
    return {
      ...base,
      shape: "valid-shape",
      suffix,
      role: SUFFIXES[suffix],
      handle,
      bankConfirmed: CONFIRMED.has(handle),
    };
  }

  return { ...base, shape: "bad-suffix", suffix, handle, didYouMean: TYPOS[suffix] };
}

// the lookahead skips emails like name@gmail.com, where a dot and letters follow the handle
const UPI_IN_TEXT = /[a-z0-9][a-z0-9._-]{0,60}@[a-z][a-z0-9]{1,30}(?![a-z0-9]|\.[a-z])/gi;

export interface UpiHit {
  id: string;
  start: number;
  end: number;
}

/** Same as findUpiIds, but also says where in the text each one sits. */
export function findUpiSpans(text: string): UpiHit[] {
  return [...text.matchAll(UPI_IN_TEXT)].map((m) => ({
    id: m[0],
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));
}

/** Finds things that look like UPI ids inside a longer message. */
export function findUpiIds(text: string): string[] {
  return [...new Set(findUpiSpans(text).map((h) => h.id))];
}
