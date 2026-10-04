import { describe, expect, it } from "vitest";
import { checkRegNumber, looksLikeRegNumber } from "./regnumber";
import { registrationProblem } from "./rules";

describe("registration number shape", () => {
  it("accepts three letters and nine digits and names the role", () => {
    const r = checkRegNumber("INA000012345");
    expect(r.shape).toBe("valid-shape");
    expect(r.role).toBe("Investment adviser");
    expect(checkRegNumber("inh000001234").role).toBe("Research analyst");
    expect(checkRegNumber("INZ000012345").role).toBe("Stock broker");
  });

  it("allows spaces and dashes the way people type it", () => {
    expect(checkRegNumber("INA 000012345").shape).toBe("valid-shape");
    expect(checkRegNumber("INH-000001234").shape).toBe("valid-shape");
  });

  it("does not name a role it is not sure about", () => {
    const r = checkRegNumber("INB231234567");
    expect(r.shape).toBe("valid-shape");
    expect(r.role).toBeUndefined();
  });

  it("catches the wrong number of digits", () => {
    expect(checkRegNumber("INA0000123").shape).toBe("wrong-length");
    expect(checkRegNumber("INA0000123456789").shape).toBe("wrong-length");
  });

  it("catches a letter that is not used", () => {
    expect(checkRegNumber("INX000012345").shape).toBe("unknown-letter");
  });

  it("calls anything else malformed", () => {
    expect(checkRegNumber("hello").shape).toBe("malformed");
    expect(checkRegNumber("").shape).toBe("malformed");
    expect(checkRegNumber("12345").shape).toBe("malformed");
  });

  it("always says format is not proof and points to the SEBI list", () => {
    const r = checkRegNumber("INA000012345");
    expect(r.formatOnly).toBe(true);
    expect(r.checkUrl).toContain("sebi.gov.in");
  });

  it("tells a registration number from a UPI id", () => {
    expect(looksLikeRegNumber("INA000012345")).toBe(true);
    expect(looksLikeRegNumber("ina 000012345")).toBe(true);
    expect(looksLikeRegNumber("abc.brk@validhdfc")).toBe(false);
    expect(looksLikeRegNumber("india@ybl")).toBe(false);
  });

  it("agrees with the rule R03 check on what is a good shape", () => {
    for (const n of ["INA000012345", "INH000001234", "INZ000012345", "INX000012345", "INA0000123"]) {
      const good = checkRegNumber(n).shape === "valid-shape";
      expect(registrationProblem(n, "") === null, n).toBe(good);
    }
  });
});
