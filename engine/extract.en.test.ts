import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import type { FactKind } from "./types";

const kinds = (t: string): FactKind[] => [...new Set(extractFacts(t).map((f) => f.kind))];
const has = (t: string, k: FactKind) => kinds(t).includes(k);

describe("extractor, English: one message per rule", () => {
  it("R01 assured returns", () => {
    expect(has("Join us, guaranteed returns every month", "assured_returns")).toBe(true);
    expect(has("100% sure profit, risk free trading", "assured_returns")).toBe(true);
    expect(has("double your money in 30 days", "assured_returns")).toBe(true);
    expect(has("Earn 5000 daily from home", "assured_returns")).toBe(true);
  });

  it("R06 asks for login details", () => {
    expect(has("Please share your OTP to continue", "credential_request")).toBe(true);
    expect(has("send me your demat password", "credential_request")).toBe(true);
    expect(has("install anydesk so I can help", "credential_request")).toBe(true);
  });

  it("R07 institutional and IPO offers", () => {
    expect(has("Get an institutional account with FII quota", "institutional_offer")).toBe(true);
    expect(has("pre-IPO shares, guaranteed allotment", "institutional_offer")).toBe(true);
    expect(has("we do upper circuit trading and block deals", "institutional_offer")).toBe(true);
  });

  it("R08 fee to withdraw", () => {
    expect(has("I must pay a 20% tax to withdraw 90000", "withdraw_fee")).toBe(true);
    expect(has("withdrawal blocked, deposit GST first to release funds", "withdraw_fee")).toBe(true);
    expect(has("pay unlock charges to get your money", "withdraw_fee")).toBe(true);
  });

  it("R09 apk and links outside the store", () => {
    expect(has("download the app from this link", "off_store_app")).toBe(true);
    expect(has("install trading.apk now", "off_store_app")).toBe(true);
    expect(has("Install our app here https://bit.ly/3xYz", "off_store_app")).toBe(true);
  });

  it("R10 VIP groups", () => {
    expect(has("You have been added to a VIP Institutional group", "vip_group")).toBe(true);
    expect(has("join our premium trading channel", "vip_group")).toBe(true);
  });

  it("R11 urgency and secrecy", () => {
    expect(has("Limited slots, invest now", "urgency_secrecy")).toBe(true);
    expect(has("Do not tell anyone in your family about this", "urgency_secrecy")).toBe(true);
    expect(has("keep this a secret", "urgency_secrecy")).toBe(true);
  });

  it("R12 profit screenshots", () => {
    expect(has("check our profit screenshots in the group", "profit_proof")).toBe(true);
    expect(has("our members earned lakhs this week", "profit_proof")).toBe(true);
  });

  it("R13 pay to get your money back", () => {
    expect(has("We can recover your lost money, pay a small processing fee", "refund_fee")).toBe(true);
    expect(has("our recovery lawyer will get it back", "refund_fee")).toBe(true);
  });

  it("R14 pretending to be an official", () => {
    expect(has("I am a SEBI officer, pay the penalty to avoid action", "official_impersonation")).toBe(true);
    expect(has("calling from the depository, share your login to avoid closure", "official_impersonation")).toBe(true);
  });

  it("R15 celebrity or AI video", () => {
    expect(has("Watch how Ratan Tata recommends this platform", "celebrity_endorsement")).toBe(true);
    expect(has("AI generated video of the finance minister", "celebrity_endorsement")).toBe(true);
  });

  it("R16 invest more or borrow", () => {
    expect(has("Invest more to unlock the next level", "invest_more")).toBe(true);
    expect(has("we will give you a loan to deposit", "invest_more")).toBe(true);
    expect(has("upgrade to VIP plan", "invest_more")).toBe(true);
  });

  it("R17 tip-channel hype", () => {
    expect(has("This is huge, to the moon! Buy now", "hype_words")).toBe(true);
    expect(has("next multibagger penny stock, target 500", "hype_words")).toBe(true);
  });

  it("R18 courses and certificates", () => {
    expect(has("Join our free trading course and mentorship", "fake_cert_or_course")).toBe(true);
    expect(has("SEBI certificate attached for proof", "fake_cert_or_course")).toBe(true);
  });
});

describe("extractor, English: clues", () => {
  it("sees a registered claim", () => {
    expect(has("We are a SEBI registered advisory", "registered_claim")).toBe(true);
  });

  it("sees a payment request and a UPI id", () => {
    const k = kinds("Pay 5000 to rajesh1234@oksbi to open your account");
    expect(k).toContain("payment_request");
    expect(k).toContain("upi_id");
  });

  it("sees fake profits, blocked apps and money already sent", () => {
    expect(has("my balance is 4 lakh in the app", "fake_profit_shown")).toBe(true);
    expect(has("the app is not opening and the group deleted", "app_blocked_or_gone")).toBe(true);
    expect(has("I have already paid 80000", "money_sent")).toBe(true);
    expect(has("I was scammed", "money_sent")).toBe(true);
  });

  it("finds a registration number", () => {
    expect(has("our SEBI reg INA000012345", "registration_number")).toBe(true);
  });

  it("finds links but ignores official ones", () => {
    expect(has("open https://win-big.xyz/vip now", "link")).toBe(true);
    expect(has("check https://siportal.sebi.gov.in/intermediary/sebi-check", "link")).toBe(false);
    expect(has("get it on https://play.google.com/store/apps/details?id=abc", "link")).toBe(false);
  });

  it("does not take an email address as a link", () => {
    expect(has("write to help@example.com", "link")).toBe(false);
  });
});

describe("extractor, English: do not cry wolf", () => {
  it("does not flag 'not guaranteed'", () => {
    expect(has("Mutual fund returns are not guaranteed", "assured_returns")).toBe(false);
    expect(has("There is no guaranteed return in the market", "assured_returns")).toBe(false);
  });

  it("does not flag 'never share your OTP'", () => {
    expect(has("Never share your OTP or password with anyone", "credential_request")).toBe(false);
    expect(has("Do not share your password", "credential_request")).toBe(false);
  });

  it("does not flag 'no fee for withdrawal'", () => {
    expect(has("There is no fee for withdrawal", "withdraw_fee")).toBe(false);
  });

  it("stays quiet on a plain statement notice", () => {
    const t =
      "Dear investor, your monthly demat statement for September is ready. Please log in to the official app to view it.";
    expect(extractFacts(t)).toEqual([]);
  });

  it("gives back the exact words from the message", () => {
    const t = "Join us, guaranteed returns every month";
    const f = extractFacts(t).find((x) => x.kind === "assured_returns");
    expect(f?.span.text.toLowerCase()).toContain("guaranteed returns");
    expect(t.slice(f!.span.start, f!.span.end)).toBe(f!.span.text);
  });

  it("finds words written in fancy fonts and points at the original", () => {
    const t = "𝐆𝐮𝐚𝐫𝐚𝐧𝐭𝐞𝐞𝐝 returns!";
    const f = extractFacts(t).find((x) => x.kind === "assured_returns");
    expect(f).toBeDefined();
    expect(f!.span.text).toContain("𝐆𝐮𝐚𝐫𝐚𝐧𝐭𝐞𝐞𝐝");
  });
});
