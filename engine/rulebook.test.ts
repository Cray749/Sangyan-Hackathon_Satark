import { describe, expect, it } from "vitest";
import { getRule, ruleBook, rulesByFact } from "./rulebook";

describe("rule book", () => {
  it("has all eighteen rules from the PRD, in order", () => {
    const ids = ruleBook.rules.map((r) => r.id);
    expect(ids).toEqual(Array.from({ length: 18 }, (_, i) => `R${String(i + 1).padStart(2, "0")}`));
  });

  it("gives every rule at least one official link", () => {
    for (const rule of ruleBook.rules) {
      expect(rule.sources.length, rule.id).toBeGreaterThan(0);
      for (const s of rule.sources) expect(s.url, rule.id).toMatch(/^https:\/\//);
    }
  });

  it("keeps the STOP-alone rules the PRD names", () => {
    const stopAlone = ruleBook.rules.filter((r) => r.severity === "S").map((r) => r.id);
    expect(stopAlone).toEqual(["R04", "R06", "R08", "R13", "R14"]);
  });

  it("never points two rules at the same fact", () => {
    const facts = ruleBook.rules.map((r) => r.fact).filter(Boolean);
    expect(new Set(facts).size).toBe(facts.length);
  });

  it("shows a review date and a version", () => {
    expect(ruleBook.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(ruleBook.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("looks rules up by id and by fact", () => {
    expect(getRule("R08").stage).toBe(6);
    expect(rulesByFact().get("withdraw_fee")?.id).toBe("R08");
  });
});
