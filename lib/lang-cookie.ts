import type { Lang } from "@/engine/types";

// The chosen language is also kept in a small cookie, so the server can draw the page in
// that language from the first byte (no flash of Hindi for a Marathi reader) and set the
// right page title. The cookie holds only "hi", "mr" or "en".
export const LANG_KEY = "satark.lang";

export function asLang(v: string | null | undefined): Lang | null {
  return v === "hi" || v === "mr" || v === "en" ? v : null;
}
