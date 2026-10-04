import { describe, expect, it } from "vitest";
import { analyze } from "@/engine/analyze";
import { messages } from "@/i18n";
import type { Lang } from "@/engine/types";
import { spokenSummary } from "./summary";

const STATEMENT =
  "Dear investor, your monthly demat statement for September is ready. Please log in to the official app to view it.";

// words that could be heard as "go ahead"
const COMFORT: Record<Lang, RegExp> = {
  en: /\b(safe|ok|okay|fine|genuine|legit|trusted)\b/i,
  hi: /सुरक्षित|ठीक है|सही है|असली है|भरोसेमंद/,
  mr: /सुरक्षित|ठीक आहे|योग्य आहे|खरे आहे|विश्वासार्ह/,
};

describe("spoken summary of the 'no red flags' answer", () => {
  for (const lang of ["en", "hi", "mr"] as Lang[]) {
    it(`${lang}: starts with check-first, never with comfort`, () => {
      const t = messages(lang);
      const a = analyze([STATEMENT]);
      expect(a.verdict.level).toBe("no_flags");
      const said = spokenSummary(a, t);
      expect(said.startsWith(t.verdict.no_flags.body)).toBe(true);
      expect(said).not.toMatch(COMFORT[lang]);
    });
  }
});
