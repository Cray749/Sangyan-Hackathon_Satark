import { describe, expect, it } from "vitest";
import handles from "../rulebook/upi-handles.json";
import { checkUpiId, findUpiIds } from "./upi";

describe("R05 validated UPI handle shape", () => {
  it("accepts the two examples printed in the SEBI circular", () => {
    expect(checkUpiId("abc.brk@validhdfc").shape).toBe("valid-shape");
    expect(checkUpiId("xyz.mf@validhdfc").shape).toBe("valid-shape");
    expect(checkUpiId("abc.brk@validicici").bankConfirmed).toBe(true);
  });

  it("accepts every one of the ten suffixes, not just brk and mf", () => {
    const all = Object.keys(handles.suffixes);
    expect(all).toHaveLength(10);
    for (const suffix of all) {
      const r = checkUpiId(`sample.${suffix}@validhdfc`);
      expect(r.shape, suffix).toBe("valid-shape");
      expect(r.role).toBeTruthy();
    }
  });

  it("does not warn falsely on a research analyst or an adviser", () => {
    expect(checkUpiId("meera.ra@validaxis").role).toBe("Research analyst");
    expect(checkUpiId("meera.ia@validaxis").role).toBe("Investment adviser");
  });

  it("is not case sensitive", () => {
    expect(checkUpiId("ABC.BRK@ValidHDFC").shape).toBe("valid-shape");
  });

  it("flags a normal personal UPI id as not validated", () => {
    expect(checkUpiId("rajesh1234@oksbi").shape).toBe("not-valid-handle");
    expect(checkUpiId("vip.invest@ybl").shape).toBe("not-valid-handle");
  });

  it("flags a wrong suffix on a @valid handle", () => {
    const r = checkUpiId("abc.trader@validhdfc");
    expect(r.shape).toBe("bad-suffix");
    expect(r.suffix).toBe("trader");
  });

  it("notices the bkr typo from the circular's own example", () => {
    const r = checkUpiId("abc.bkr@validhdfc");
    expect(r.shape).toBe("bad-suffix");
    expect(r.didYouMean).toBe("brk");
  });

  it("needs a name before the suffix", () => {
    expect(checkUpiId("brk@validhdfc").shape).toBe("bad-suffix");
    expect(checkUpiId(".brk@validhdfc").shape).toBe("malformed");
  });

  it("does not trust a handle that only starts with the word valid", () => {
    expect(checkUpiId("abc.brk@valid").shape).toBe("not-valid-handle");
  });

  it("marks bank codes the circular never printed as unconfirmed", () => {
    const r = checkUpiId("abc.brk@validsomebank");
    expect(r.shape).toBe("valid-shape");
    expect(r.bankConfirmed).toBe(false);
  });

  it("calls garbage malformed", () => {
    expect(checkUpiId("").shape).toBe("malformed");
    expect(checkUpiId("hello world").shape).toBe("malformed");
    expect(checkUpiId("a@b@c").shape).toBe("malformed");
  });

  it("always says format is not proof", () => {
    expect(checkUpiId("abc.brk@validhdfc").formatOnly).toBe(true);
    expect(checkUpiId("abc.brk@validhdfc").checkUrl).toContain("sebi.gov.in");
  });
});

describe("finding UPI ids in a message", () => {
  it("pulls the id out of a group invite", () => {
    const msg = "Open your account, pay 5000 to rajesh1234@oksbi today. Join now!";
    expect(findUpiIds(msg)).toEqual(["rajesh1234@oksbi"]);
  });

  it("ignores email addresses", () => {
    expect(findUpiIds("write to help@gmail.com or support@mail.co.in")).toEqual([]);
  });

  it("finds more than one and removes repeats", () => {
    const msg = "a.brk@validhdfc or vip@ybl, again vip@ybl";
    expect(findUpiIds(msg)).toEqual(["a.brk@validhdfc", "vip@ybl"]);
  });
});
