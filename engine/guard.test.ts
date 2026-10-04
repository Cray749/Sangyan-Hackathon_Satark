import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import { applyContextGuard } from "./guard";

const run = (t: string) => applyContextGuard(t, extractFacts(t));
const live = (t: string) => run(t).filter((f) => !f.ignored).map((f) => f.kind);
const ignored = (t: string) => run(t).filter((f) => f.ignored).map((f) => f.kind);

describe("context guard", () => {
  it("sets aside red-flag words inside an awareness post", () => {
    const t =
      "Beware! Fraudsters promise guaranteed returns and ask you to pay a fee to withdraw. Never share your OTP.";
    expect(live(t)).not.toContain("assured_returns");
    expect(live(t)).not.toContain("withdraw_fee");
    expect(ignored(t)).toContain("assured_returns");
  });

  it("works for a Hindi awareness post", () => {
    const t = "सावधान! ठग अक्सर गारंटीड रिटर्न का वादा करते हैं। ऐसे झांसे में न आएं।";
    expect(live(t)).not.toContain("assured_returns");
  });

  it("does not hide behind a warning when there is a live ask", () => {
    const t = "Beware of scams! Pay 5000 to rajesh@ybl for guaranteed returns.";
    expect(live(t)).toContain("assured_returns");
    expect(live(t)).toContain("upi_id");
    expect(ignored(t)).toEqual([]);
  });

  it("does not hide behind a warning when there is an outside link", () => {
    const t = "Be careful out there. Guaranteed returns, join at https://win-big.xyz/vip";
    expect(live(t)).toContain("assured_returns");
  });

  it("keeps the user's own story even in a warning post", () => {
    const t = "Beware friends. I already paid 50000 and now the app is not opening.";
    expect(live(t)).toContain("money_sent");
    expect(live(t)).toContain("app_blocked_or_gone");
  });

  it("leaves a normal scam message untouched", () => {
    const t = "Guaranteed returns every month, join our VIP group now";
    expect(ignored(t)).toEqual([]);
  });

  it("sets aside quoted phrases when the post is a warning", () => {
    const t = 'Be aware: scammers say "guaranteed returns" and "risk free trading" to lure you.';
    expect(live(t)).not.toContain("assured_returns");
  });
});
