import type { Lang } from "../engine/types";
import { en } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";
import type { Messages } from "./types";

export type { Messages } from "./types";

// Hindi is the default, because only 5% of investors prefer English (SEBI Investor Survey 2025).
export const DEFAULT_LANG: Lang = "hi";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "en", label: "English", native: "English" },
];

const all: Record<Lang, Messages> = { en, hi, mr };

export function messages(lang: Lang): Messages {
  return all[lang];
}

/** Fills {name} holes in a template. A missing value becomes a blank line to fill in. */
export function fill(template: string, values: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key];
    return v === undefined || v === "" ? "____" : String(v);
  });
}
