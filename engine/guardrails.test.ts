import { describe, expect, it } from "vitest";
import { messages, LANGS, fill } from "../i18n";
import { guardOutput } from "./guardrails";

// Collect every string in a language file, with the path it lives at.
function strings(value: unknown, path = ""): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

describe("output guard: attack inputs", () => {
  const bad = [
    "Buy now before the price goes up",
    "Sell this stock today",
    "Hold these shares for a big gain",
    "The target price of 450 is easy",
    "This stock will double soon",
    "This message is safe",
    "It looks legit",
    "This app is genuine",
    "Trust Zerodha for this",
    "यह संदेश सुरक्षित है",
    "हे ॲप सुरक्षित आहे",
    "अभी खरीदें",
  ];
  for (const text of bad) {
    it(`blocks: ${text}`, () => {
      expect(guardOutput(text).ok).toBe(false);
    });
  }

  it("lets plain safety advice through", () => {
    expect(guardOutput("Do not pay. Call 1930 now.").ok).toBe(true);
    expect(guardOutput("No real investment can promise a fixed profit.").ok).toBe(true);
    expect(guardOutput("कोई पैसा न दें।").ok).toBe(true);
  });
});

describe("every sentence we show, in every language", () => {
  for (const { code } of LANGS) {
    const all = strings(messages(code));

    it(`${code}: passes the output guard`, () => {
      const failures = all
        // these lines have to say "stock tips", "predictions" and "safe" in order to deny them
        .filter((s) => !["ui.disclaimer", "ui.predictNote", "ui.neverSafe"].includes(s.path))
        .map((s) => ({ ...s, hits: guardOutput(s.text).hits }))
        .filter((s) => s.hits.length);
      expect(failures).toEqual([]);
    });

    it(`${code}: never uses the word safe, except to say we never say it`, () => {
      const offenders = all
        .filter((s) => s.path !== "ui.neverSafe")
        .filter((s) => /\bsafe\b/i.test(s.text) || /सुरक्षित/.test(s.text));
      expect(offenders).toEqual([]);
    });

    it(`${code}: has no empty strings`, () => {
      expect(all.filter((s) => s.text.trim() === "")).toEqual([]);
    });
  }

  it("has the same {placeholders} in every language", () => {
    const holes = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
    const en = strings(messages("en"));
    for (const lang of ["hi", "mr"] as const) {
      const other = new Map(strings(messages(lang)).map((s) => [s.path, s.text]));
      for (const s of en) {
        expect(holes(other.get(s.path) ?? ""), `${lang} ${s.path}`).toBe(holes(s.text));
      }
    }
  });

  it("has as many steps and checklist items in every language", () => {
    const en = messages("en");
    for (const lang of ["hi", "mr"] as const) {
      const m = messages(lang);
      expect(m.emergency.checklist.length).toBe(en.emergency.checklist.length);
      expect(m.emergency.evidence.length).toBe(en.emergency.evidence.length);
      expect(m.prepay.steps.length).toBe(en.prepay.steps.length);
      for (const key of Object.keys(en.routes) as (keyof typeof en.routes)[]) {
        expect(m.routes[key].steps.length, `${lang} ${key}`).toBe(en.routes[key].steps.length);
      }
    }
  });
});

describe("fill", () => {
  it("fills known holes and leaves a blank for missing ones", () => {
    expect(fill("Paid {amount} to {payee}", { amount: 500 })).toBe("Paid 500 to ____");
  });
});
