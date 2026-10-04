import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import type { FactKind } from "./types";

const kinds = (t: string): FactKind[] => [...new Set(extractFacts(t).map((f) => f.kind))];
const has = (t: string, k: FactKind) => kinds(t).includes(k);

describe("extractor, Marathi", () => {
  it("R01 खात्रीशीर परतावा (Ramesh's group)", () => {
    expect(has("आमच्यासोबत जोडा, खात्रीशीर परतावा मिळेल", "assured_returns")).toBe(true);
    expect(has("हमी परतावा दरमहा", "assured_returns")).toBe(true);
    expect(has("पैसे दुप्पट करा", "assured_returns")).toBe(true);
  });

  it("R10 व्हीआयपी ग्रुप", () => {
    expect(has("तुम्हाला व्हीआयपी इन्स्टिट्यूशनल ग्रुप मध्ये जोडले आहे", "vip_group")).toBe(true);
  });

  it("R04 clue: खाते उघडण्यासाठी पैसे भरा", () => {
    expect(has("खाते उघडण्यासाठी 5000 रुपये पाठवा", "payment_request")).toBe(true);
  });

  it("R08 पैसे काढण्यासाठी टॅक्स", () => {
    expect(has("पैसे काढण्यासाठी २०% टॅक्स भरावा लागेल", "withdraw_fee")).toBe(true);
  });

  it("R06 ओटीपी सांगा", () => {
    expect(has("तुमचा ओटीपी सांगा", "credential_request")).toBe(true);
    expect(has("पासवर्ड पाठवा", "credential_request")).toBe(true);
  });

  it("R14 अधिकारी बनून फोन", () => {
    expect(has("मी डिपॉझिटरी कडून बोलतो, लॉगिन सांगा नाहीतर खाते बंद होईल", "official_impersonation")).toBe(true);
  });

  it("R11 घाई करा, कोणालाही सांगू नका", () => {
    expect(has("मर्यादित जागा आहेत, घाई करा", "urgency_secrecy")).toBe(true);
    expect(has("हे कोणालाही सांगू नका", "urgency_secrecy")).toBe(true);
  });

  it("R13 पैसे परत मिळवून देण्यासाठी फी", () => {
    expect(has("तुमचे बुडालेले पैसे परत मिळतील, फक्त प्रोसेसिंग फी जमा करा", "refund_fee")).toBe(true);
  });

  it("clues", () => {
    expect(has("मी ५०००० रुपये पाठवले", "money_sent")).toBe(true);
    expect(has("फसवणूक झाली", "money_sent")).toBe(true);
    expect(has("ॲप बंद झाले आणि ग्रुप डिलीट", "app_blocked_or_gone")).toBe(true);
    expect(has("ॲप मध्ये नफा दिसत आहे", "fake_profit_shown")).toBe(true);
    expect(has("आम्ही सेबी कडे नोंदणीकृत आहोत", "registered_claim")).toBe(true);
  });

  it("does not flag advice", () => {
    expect(has("कधीही ओटीपी शेअर करू नका", "credential_request")).toBe(false);
    expect(has("परताव्याची हमी नाही", "assured_returns")).toBe(false);
  });

  it("sees a warning cue", () => {
    expect(has("सावध रहा! ठगांपासून दूर राहा", "warning_cue")).toBe(true);
  });
});
