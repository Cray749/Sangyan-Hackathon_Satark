import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import { applyContextGuard } from "./guard";
import { deriveFlags, registrationProblem } from "./rules";
import type { RuleId } from "./types";

const ids = (text: string): RuleId[] => {
  const facts = applyContextGuard(text, extractFacts(text));
  return deriveFlags(facts, [text]).map((f) => f.ruleId);
};

describe("rules: one fact, one rule", () => {
  it("turns facts into flags with their severity", () => {
    const text = "Guaranteed returns! Pay a 20% tax to withdraw.";
    const facts = extractFacts(text);
    const flags = deriveFlags(facts, [text]);
    expect(flags.find((f) => f.ruleId === "R01")?.severity).toBe("H");
    expect(flags.find((f) => f.ruleId === "R08")?.severity).toBe("S");
  });

  it("keeps the user's own words as evidence", () => {
    const text = "Guaranteed returns every month";
    const flag = deriveFlags(extractFacts(text), [text]).find((f) => f.ruleId === "R01");
    expect(flag?.evidence[0]?.text.toLowerCase()).toContain("guaranteed returns");
  });

  it("ignores facts the context guard set aside", () => {
    expect(ids("Beware! Fraudsters promise guaranteed returns. Never share your OTP.")).toEqual([]);
  });
});

describe("R02: says SEBI registered but gives no number", () => {
  it("fires with a claim and no number", () => {
    expect(ids("We are a SEBI registered advisory, call us")).toContain("R02");
  });

  it("does not fire when a number is shown", () => {
    expect(ids("We are SEBI registered, reg no INA000012345")).not.toContain("R02");
  });
});

describe("R03: registration number shape", () => {
  it("accepts good numbers", () => {
    expect(registrationProblem("INA000012345", "")).toBeNull();
    expect(registrationProblem("INH000001234", "")).toBeNull();
    expect(registrationProblem("INZ000012345", "")).toBeNull();
  });

  it("rejects the wrong length or an unknown letter", () => {
    expect(registrationProblem("INA0000123", "")).toBe("length");
    expect(registrationProblem("INX000012345", "")).toBe("letter");
  });

  it("rejects a number that does not fit the role claimed", () => {
    // INH is a research analyst, so it cannot belong to an investment adviser
    expect(registrationProblem("INH000012345", "we are a registered investment adviser")).toBe("role");
    expect(registrationProblem("INA000012345", "we are a registered investment adviser")).toBeNull();
  });

  it("fires on a message with a bad number", () => {
    expect(ids("SEBI registered research analyst INA000012345")).toContain("R03");
    expect(ids("SEBI registered research analyst INH000012345")).not.toContain("R03");
  });
});

describe("R04: asked to pay a personal UPI id or account", () => {
  it("fires for a personal UPI id with a payment ask (Ramesh)", () => {
    expect(ids("Pay 5000 to rajesh1234@oksbi to open your account")).toContain("R04");
  });

  it("does not fire for a validated handle shape", () => {
    expect(ids("Pay 5000 to abc.brk@validhdfc for your account")).not.toContain("R04");
  });

  it("does not fire when nobody asks for money", () => {
    expect(ids("my friend uses rajesh1234@oksbi for tea money")).not.toContain("R04");
  });

  it("fires for a bank account being asked for", () => {
    expect(ids("Transfer 10000 to account number 123456789012 IFSC HDFC0001234")).toContain("R04");
  });
});

describe("R05: presents as registered, but the UPI id is not a validated handle", () => {
  it("fires with a claim and a personal id", () => {
    expect(ids("We are SEBI registered. Pay to rajesh1234@oksbi")).toContain("R05");
  });

  it("fires for a lookalike @valid handle with a wrong suffix", () => {
    expect(ids("pay 5000 to abc.trader@validhdfc")).toContain("R05");
    expect(ids("pay 5000 to abc.bkr@validhdfc")).toContain("R05");
  });

  it("does not fire for a real-shaped handle", () => {
    expect(ids("We are SEBI registered. Pay to abc.brk@validhdfc")).not.toContain("R05");
  });

  it("does not fire for a personal id when nobody claims to be registered", () => {
    expect(ids("send money to rajesh1234@oksbi")).not.toContain("R05");
  });
});
