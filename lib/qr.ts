// Payment QR codes hold a link like  upi://pay?pa=name.brk@validhdfc&pn=Name&am=500
// We only need the payee id (pa) so we can run the Pre-Pay Check on it. The camera work
// is done by the browser; this file only reads the text it finds.

export interface UpiQr {
  /** The UPI id being paid. */
  id: string;
  /** The payee name the QR claims. Shown so the person can compare it on SEBI Check. */
  name?: string;
  amount?: string;
}

export function parseUpiQr(text: string): UpiQr | null {
  const trimmed = text.trim();
  if (!/^upi:\/\//i.test(trimmed)) {
    // some people paste or scan just the id
    return /^[a-z0-9._-]{2,60}@[a-z][a-z0-9]{1,30}$/i.test(trimmed) ? { id: trimmed } : null;
  }
  try {
    const url = new URL(trimmed);
    const id = url.searchParams.get("pa");
    if (!id) return null;
    return {
      id,
      name: url.searchParams.get("pn") ?? undefined,
      amount: url.searchParams.get("am") ?? undefined,
    };
  } catch {
    return null;
  }
}
