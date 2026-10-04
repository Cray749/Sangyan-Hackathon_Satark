import { describe, expect, it } from "vitest";
import { wilson } from "./stats";

describe("wilson interval", () => {
  it("0 of 100 still allows a few percent", () => {
    const w = wilson({ k: 0, n: 100 });
    expect(w?.low).toBe(0);
    expect(w?.high).toBeGreaterThan(3);
    expect(w?.high).toBeLessThan(4.5);
  });

  it("is narrower for more data", () => {
    const small = wilson({ k: 9, n: 10 });
    const big = wilson({ k: 900, n: 1000 });
    expect((big?.high ?? 0) - (big?.low ?? 0)).toBeLessThan((small?.high ?? 0) - (small?.low ?? 0));
  });

  it("has nothing to say about an empty set", () => {
    expect(wilson({ k: 0, n: 0 })).toBeNull();
  });
});
