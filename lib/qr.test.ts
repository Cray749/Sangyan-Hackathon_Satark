import { describe, expect, it } from "vitest";
import { parseUpiQr } from "./qr";

describe("payment QR", () => {
  it("reads the payee id, name and amount from a upi link", () => {
    expect(parseUpiQr("upi://pay?pa=abc.brk@validhdfc&pn=ABC%20Securities&am=500&cu=INR")).toEqual({
      id: "abc.brk@validhdfc",
      name: "ABC Securities",
      amount: "500",
    });
  });

  it("works when only the id is given", () => {
    expect(parseUpiQr("rajesh1234@oksbi")).toEqual({ id: "rajesh1234@oksbi" });
  });

  it("gives null for other kinds of QR", () => {
    expect(parseUpiQr("https://example.com/menu")).toBeNull();
    expect(parseUpiQr("WIFI:S:home;T:WPA;P:secret;;")).toBeNull();
    expect(parseUpiQr("upi://pay?pn=NoPayee")).toBeNull();
    expect(parseUpiQr("")).toBeNull();
  });
});
