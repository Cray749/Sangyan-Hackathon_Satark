import { describe, expect, it } from "vitest";
import { analyze } from "./analyze";
import { AI_KINDS, spanCheck } from "./ai-facts";

const text = "Our people made huge gains lately, the whole group is secure and the money is locked. Ask me how.";

describe("AI facts: the span check", () => {
  it("keeps a fact whose quote is in the text, and points at the user's words", () => {
    const facts = spanCheck(text, { facts: [{ kind: "assured_returns", quote: "the money is locked" }] });
    expect(facts).toHaveLength(1);
    expect(facts[0]?.origin).toBe("ai");
    expect(text.slice(facts[0]!.span.start, facts[0]!.span.end)).toBe("the money is locked");
  });

  it("throws away a quote that is not in the text", () => {
    const facts = spanCheck(text, { facts: [{ kind: "assured_returns", quote: "guaranteed 100% returns" }] });
    expect(facts).toEqual([]);
  });

  it("is not fooled by case or fancy letters in the quote", () => {
    const facts = spanCheck(text, { facts: [{ kind: "vip_group", quote: "THE WHOLE GROUP" }] });
    expect(facts).toHaveLength(1);
  });

  it("refuses kinds it does not know, such as a verdict", () => {
    expect(spanCheck(text, { facts: [{ kind: "safe", quote: "Ask me how" }] })).toEqual([]);
    expect(spanCheck(text, { facts: [{ kind: "verdict_ok", quote: "Ask me how" }] })).toEqual([]);
  });

  it("can not add a warning cue, which could hide real flags", () => {
    expect(AI_KINDS).not.toContain("warning_cue");
    expect(spanCheck(text, { facts: [{ kind: "warning_cue", quote: "Ask me how" }] })).toEqual([]);
  });

  it("returns nothing for a broken reply", () => {
    expect(spanCheck(text, "not json")).toEqual([]);
    expect(spanCheck(text, { facts: "no" })).toEqual([]);
    expect(spanCheck(text, null)).toEqual([]);
  });

  it("drops very short and repeated quotes", () => {
    const facts = spanCheck(text, {
      facts: [
        { kind: "assured_returns", quote: "a" },
        { kind: "assured_returns", quote: "the money is locked" },
        { kind: "assured_returns", quote: "the money is locked" },
      ],
    });
    expect(facts).toHaveLength(1);
  });
});

describe("AI facts: the rule book still decides", () => {
  it("an AI fact can raise a flag the word lists missed", () => {
    const rulesOnly = analyze([text]);
    const withAi = analyze([text], {
      extraFacts: [spanCheck(text, { facts: [{ kind: "assured_returns", quote: "the money is locked" }] })],
    });
    expect(rulesOnly.flags.map((f) => f.ruleId)).not.toContain("R01");
    expect(withAi.flags.map((f) => f.ruleId)).toContain("R01");
  });

  it("an AI that is tricked into saying everything is fine changes nothing", () => {
    const scam = "Guaranteed returns, pay Rs 5000 to rahul88@ybl to join.";
    const plain = analyze([scam]);
    const tricked = analyze([scam], { extraFacts: [spanCheck(scam, { facts: [] })] });
    expect(tricked.verdict.level).toBe(plain.verdict.level);
    expect(tricked.verdict.level).toBe("stop");
  });

  it("AI facts only ever add; they can not lower a verdict", () => {
    const scam = "Guaranteed returns, pay Rs 5000 to rahul88@ybl to join.";
    const base = analyze([scam]).flags.length;
    const more = analyze([scam], {
      extraFacts: [spanCheck(scam, { facts: [{ kind: "vip_group", quote: "to join" }] })],
    }).flags.length;
    expect(more).toBeGreaterThanOrEqual(base);
  });
});
