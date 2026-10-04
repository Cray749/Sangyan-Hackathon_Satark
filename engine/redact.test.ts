import { describe, expect, it } from "vitest";
import { redact } from "./redact";

const kinds = (t: string) => redact(t).redactions.map((r) => r.kind);

describe("redactor", () => {
  it("hides an Indian mobile number", () => {
    const r = redact("call me on 9876543210 now");
    expect(r.text).toBe("call me on XXXXXXXXXX now");
    expect(kinds("call me on 9876543210 now")).toEqual(["phone"]);
  });

  it("hides a number with +91 and spaces", () => {
    expect(redact("whatsapp +91 98765 43210").text).not.toMatch(/\d/);
  });

  it("hides a PAN and an Aadhaar number", () => {
    expect(kinds("PAN ABCDE1234F")).toEqual(["pan"]);
    expect(kinds("aadhaar 2345 6789 0123")).toEqual(["aadhaar"]);
  });

  it("hides a long bank account number", () => {
    expect(kinds("a/c 123456789012345")).toEqual(["account"]);
  });

  it("hides only the digits of an otp, not the word", () => {
    const r = redact("your OTP is 482913, share it");
    expect(r.text).toBe("your OTP is XXXXXX, share it");
    expect(r.redactions[0]?.kind).toBe("otp");
  });

  it("hides email addresses", () => {
    expect(redact("mail ramesh.k@gmail.com").text).toBe("mail " + "X".repeat(18));
  });

  it("works on Devanagari digits too", () => {
    const r = redact("नंबर ९८७६५४३२१०");
    expect(r.text).toContain("XXXXXXXXXX");
  });

  it("leaves a UPI id alone, even with digits in it", () => {
    const r = redact("pay to rajesh9876543210@oksbi today");
    expect(r.text).toBe("pay to rajesh9876543210@oksbi today");
  });

  it("leaves amounts and the 1930 helpline alone", () => {
    const t = "pay ₹90,000 or call 1930";
    expect(redact(t).text).toBe(t);
  });

  it("keeps the text the same length, so positions stay valid", () => {
    const t = "ph 9876543210, pan ABCDE1234F, otp 123456 ok";
    expect(redact(t).text.length).toBe(t.length);
  });

  it("does nothing to a plain message", () => {
    const t = "Join our VIP group for guaranteed returns";
    expect(redact(t)).toEqual({ text: t, redactions: [] });
  });
});
