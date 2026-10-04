import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import { applyContextGuard } from "./guard";
import { inferStage, nextStage, stageSignals, STAGES } from "./journey";
import { deriveFlags } from "./rules";
import type { Stage } from "./types";

function stageOf(text: string, previous: Stage | null = null, userStage: Stage | null = null) {
  const facts = applyContextGuard(text, extractFacts(text));
  const flags = deriveFlags(facts, [text]);
  return inferStage(stageSignals(flags, facts), previous, userStage);
}

describe("journey", () => {
  it("has eight stages", () => {
    expect(STAGES).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("puts Ramesh's group invite at stage 3 (hook, app and a personal UPI id)", () => {
    const invite =
      "You are added to VIP Institutional group. Guaranteed returns! Download the app from this link https://win-big.xyz/app.apk and pay 5000 to rajesh1234@oksbi to open your account";
    expect(stageOf(invite)).toBe(3);
  });

  it("moves Priya to stage 6 when a tax is asked to withdraw", () => {
    expect(stageOf("I must pay a 20% tax to withdraw 90000")).toBe(6);
  });

  it("puts a plain hook at stage 1", () => {
    expect(stageOf("Guaranteed returns, join our VIP group")).toBe(1);
  });

  it("sees fake profits as stage 4", () => {
    expect(stageOf("the app shows profit and my first withdrawal worked")).toBe(4);
  });

  it("sees an offer to recover money as stage 8", () => {
    expect(stageOf("We can recover your lost money, pay a small processing fee")).toBe(8);
  });

  it("sees a closed app as stage 7", () => {
    expect(stageOf("the app is not opening and the group deleted")).toBe(7);
  });

  it("never moves backwards on its own", () => {
    expect(stageOf("Guaranteed returns", 6)).toBe(6);
  });

  it("moves back only when the user corrects it, and can move forward again", () => {
    expect(stageOf("Guaranteed returns", 6, 2)).toBe(2);
    expect(stageOf("pay a tax to withdraw", 6, 2)).toBe(6);
  });

  it("gives no stage when there is nothing to go on", () => {
    expect(stageOf("Your statement is ready")).toBeNull();
  });

  it("knows the next stage of the script", () => {
    expect(nextStage(3)).toBe(4);
    expect(nextStage(7)).toBe(8);
    expect(nextStage(8)).toBeNull();
  });

  it("explains which rule pointed at the stage", () => {
    const text = "pay a tax to withdraw";
    const facts = extractFacts(text);
    const signals = stageSignals(deriveFlags(facts, [text]), facts);
    expect(signals).toContainEqual({ stage: 6, because: "R08" });
  });
});
