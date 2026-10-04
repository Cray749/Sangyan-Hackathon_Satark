import { describe, expect, it } from "vitest";
import { analyze } from "./analyze";
import { radarEvent, scamTypeOf, SCAM_TYPES } from "./radar";
import { examples } from "../i18n/examples";

describe("radar events", () => {
  it("names the kind of scam from the flags", () => {
    const type = (t: string) => scamTypeOf(analyze([t]).flags);
    expect(type("We can recover your lost money, pay a small processing fee")).toBe("recovery_scam");
    expect(type("Share your OTP and password to keep your demat active")).toBe("credential_theft");
    expect(type("Pay 20% tax to withdraw your funds")).toBe("withdrawal_fee");
    expect(type("Join our VIP group, guaranteed returns")).toBe("fake_app_group");
    expect(type("Get pre-IPO allotment through our institutional account")).toBe("institutional_offer");
  });

  it("gives null when there is nothing to count", () => {
    const calm = examples("en").find((e) => e.id === "notice")!.text;
    expect(radarEvent(analyze([calm]), "en")).toBeNull();
  });

  it("carries the stage at first contact, the language and the level, nothing else", () => {
    const invite = examples("hi").find((e) => e.id === "invite")!.text;
    const event = radarEvent(analyze([invite]), "hi");
    expect(event).toEqual({ scamType: "fake_app_group", lang: "hi", stage: 3, level: "stop" });
    expect(Object.keys(event!).sort()).toEqual(["lang", "level", "scamType", "stage"]);
  });

  it("never puts the user's words into the event", () => {
    const text = "Join VIP group, guaranteed returns, pay to secretname99@ybl";
    const json = JSON.stringify(radarEvent(analyze([text]), "en"));
    expect(json).not.toContain("secretname99");
    expect(json).not.toContain("guaranteed");
  });

  it("lists every scam type it can emit", () => {
    expect(SCAM_TYPES).toContain("other");
    expect(new Set(SCAM_TYPES).size).toBe(SCAM_TYPES.length);
  });
});
