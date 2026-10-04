import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ruleBook } from "../engine/rulebook";
import { buildReport } from "./metrics";
import type { Item } from "./types";

// This is the evaluation, run as a test. CI runs it with the AI switched off (there is no
// key in CI), so it also proves the core stands alone. If a change to the word lists makes
// the promises worse, the build fails.

const load = (path: string): Item[] =>
  readFileSync(new URL(path, import.meta.url), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Item);

const main = load("../data/eval.jsonl");
const adv = load("../data/adversarial.jsonl");
const report = buildReport(main, adv, ruleBook.version);

describe("the labelled set", () => {
  it("has the 400 + 40 items the PRD asks for", () => {
    expect(main).toHaveLength(400);
    expect(adv).toHaveLength(40);
  });

  it("is about 60% scams, 25% genuine and 15% hard", () => {
    const share = (pred: (i: Item) => boolean) => main.filter(pred).length / main.length;
    expect(share((i) => i.kind === "scam_msg" || i.kind === "victim_story")).toBeCloseTo(0.6, 1);
    expect(share((i) => i.kind === "genuine")).toBeCloseTo(0.25, 1);
    expect(share((i) => i.kind === "hard")).toBeCloseTo(0.15, 1);
  });

  it("covers Hindi, Hinglish, Marathi and English", () => {
    for (const style of ["en", "hi", "hinglish", "mr"]) {
      expect(main.some((i) => i.style === style), style).toBe(true);
    }
  });
});

describe("promises that must always hold", () => {
  it("never says safe", () => {
    expect(report.promises.neverSafeViolations).toBe(0);
  });

  it("a prompt-injection trick never softens a verdict", () => {
    expect(report.promises.injectionTried).toBeGreaterThanOrEqual(10);
    expect(report.promises.injectionLowered).toBe(0);
  });

  it("does not wave a scam through as clear", () => {
    expect(report.overall.scamClearedRate ?? 100).toBeLessThanOrEqual(2);
  });
});

describe("quality floors (not targets, just a guard against going backwards)", () => {
  it("catches at least 90% of scam messages, and does better than a keyword filter", () => {
    expect(report.overall.catchRate ?? 0).toBeGreaterThanOrEqual(90);
    expect(report.overall.catchRate ?? 0).toBeGreaterThan(report.baseline.catchRate ?? 100);
  });

  it("scares people with no more than 5% of genuine messages, far below the keyword filter", () => {
    expect(report.overall.falseAlarmRate ?? 100).toBeLessThanOrEqual(5);
    expect(report.overall.falseAlarmRate ?? 100).toBeLessThan((report.baseline.falseAlarmRate ?? 0) / 2);
  });

  it("opens Emergency Mode for almost every victim who already lost money", () => {
    expect(report.overall.emergencyRate ?? 0).toBeGreaterThanOrEqual(90);
  });

  it("asks 'have you paid?' for late stories, and opens Emergency only when money moved", () => {
    expect(report.overall.askPaidRate ?? 0).toBeGreaterThanOrEqual(90);
    expect(report.overall.emergencyFalseRate ?? 100).toBeLessThanOrEqual(2);
  });

  it("holds up on the adversarial set", () => {
    expect(report.adversarial.falseAlarmRate ?? 100).toBe(0);
    expect(report.adversarial.catchRate ?? 0).toBeGreaterThanOrEqual(85);
  });

  it("works in every language style", () => {
    for (const g of Object.values(report.byStyle)) {
      expect(g.catchRate ?? 0).toBeGreaterThanOrEqual(85);
      expect(g.falseAlarmRate ?? 100).toBeLessThanOrEqual(5);
    }
  });
});
