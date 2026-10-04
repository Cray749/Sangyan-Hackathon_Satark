import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import { applyContextGuard } from "./guard";
import { inferStage, stageSignals } from "./journey";
import { planActions } from "./planner";
import { deriveFlags } from "./rules";
import { decideVerdict } from "./verdict";

function plan(text: string) {
  const facts = applyContextGuard(text, extractFacts(text));
  const flags = deriveFlags(facts, [text]);
  const verdict = decideVerdict(flags, facts, [text]);
  const stage = inferStage(stageSignals(flags, facts));
  return planActions({ level: verdict.level, flags, facts, stage });
}

describe("planner: before any money moved (Ramesh)", () => {
  const p = plan(
    "You are added to VIP Institutional group. Guaranteed returns! Download the app from this link https://win-big.xyz/app.apk and pay 5000 to rajesh1234@oksbi to open your account",
  );

  it("is not an emergency yet", () => {
    expect(p.emergency).toBe(false);
  });

  it("says do not pay, do not install, and verify on SEBI Check", () => {
    expect(p.actions).toContain("dont_pay");
    expect(p.actions).toContain("dont_install");
    expect(p.actions).toContain("verify_sebi_check");
  });

  it("offers the family alert", () => {
    expect(p.offerFamilyAlert).toBe(true);
  });

  it("warns about the next stage, fake profits", () => {
    expect(p.nextStage).toBe(4);
  });
});

describe("planner: stage 6 (Priya) before she answers", () => {
  const p = plan("I must pay a 20% tax to withdraw 90000");

  it("asks 'have you already paid?' instead of jumping to Emergency Mode", () => {
    expect(p.emergency).toBe(false);
    expect(p.askPaid).toBe(true);
  });

  it("says do not pay in the meantime", () => {
    expect(p.actions).toContain("dont_pay");
  });
});

describe("planner: stage 6 after she answers", () => {
  function late(paid: "yes" | "no" | null) {
    const text = "I must pay a 20% tax to withdraw 90000";
    const facts = applyContextGuard(text, extractFacts(text));
    const flags = deriveFlags(facts, [text]);
    const verdict = decideVerdict(flags, facts, [text]);
    const stage = inferStage(stageSignals(flags, facts));
    return planActions({ level: verdict.level, flags, facts, stage, paid });
  }

  it("'not yet' keeps the STOP screen and stops asking", () => {
    const p = late("no");
    expect(p.emergency).toBe(false);
    expect(p.askPaid).toBe(false);
    expect(p.actions).not.toContain("call_1930");
  });

  it("'yes' opens Emergency Mode", () => {
    const p = late("yes");
    expect(p.emergency).toBe(true);
    expect(p.askPaid).toBe(false);
  });
});

describe("planner: once money has moved", () => {
  const p = plan("I paid 90000 to the app but they ask a 20% tax to withdraw. I must pay it");

  it("switches to Emergency Mode", () => {
    expect(p.emergency).toBe(true);
  });

  it("puts the 1930 call first after not paying", () => {
    expect(p.actions.slice(0, 2)).toEqual(["dont_pay", "call_1930"]);
  });

  it("routes to 1930 and cybercrime.gov.in, never to SCORES", () => {
    expect(p.routes).toContain("money_sent");
    expect(p.routes).toContain("unregistered");
    expect(p.routes).not.toContain("registered");
    expect(p.links).not.toContain("scores");
    expect(p.links).toContain("cybercrime");
  });
});

describe("planner: other situations", () => {
  it("treats 'I already paid' as an emergency even with no other flags", () => {
    const p = plan("I already paid 80000 to a stranger yesterday");
    expect(p.emergency).toBe(true);
    expect(p.routes).toContain("money_sent");
  });

  it("sends a password request to the credentials route", () => {
    const p = plan("Please share your password and OTP to keep your demat active");
    expect(p.routes).toContain("credentials");
    expect(p.actions).toContain("change_password");
    expect(p.actions).toContain("contact_broker_dp");
  });

  it("sends a recovery offer to the recovery route and warns off the fee", () => {
    const p = plan("We can recover your lost money, pay a small processing fee");
    expect(p.routes).toContain("recovery");
    expect(p.actions).toContain("no_recovery_fee");
  });

  it("sends a complaint about a real broker to SCORES", () => {
    const p = plan("My broker has not returned my securities since last month and ignored my mails");
    expect(p.routes).toContain("registered");
    expect(p.links).toContain("scores");
  });

  it("for a clear message says to open the official app and not click links", () => {
    const p = plan(
      "Dear investor, your monthly demat statement for September is ready. Please log in to the official app to view it.",
    );
    expect(p.emergency).toBe(false);
    expect(p.actions).toEqual(["open_official_app", "dont_click"]);
    expect(p.offerFamilyAlert).toBe(false);
  });
});

describe("planner: the person answers 'yes, I paid'", () => {
  it("opens Emergency Mode even when the words never said so", () => {
    const text = "Guaranteed returns, join our VIP group now";
    const facts = applyContextGuard(text, extractFacts(text));
    const flags = deriveFlags(facts, [text]);
    const verdict = decideVerdict(flags, facts, [text]);
    const stage = inferStage(stageSignals(flags, facts));
    const p = planActions({ level: verdict.level, flags, facts, stage, paid: "yes" });
    expect(p.emergency).toBe(true);
    expect(p.routes[0]).toBe("money_sent");
  });
});
