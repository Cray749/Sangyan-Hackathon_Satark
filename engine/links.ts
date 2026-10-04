// Every outside place Satark ever sends a person. Official sources only, nothing else.
// If a link here is wrong, a real person could go to the wrong office, so a teammate must
// open each one before the final submission (see docs/PRD.md section 23).

export const HELPLINE = "1930";

export const LINKS = {
  cybercrime: "https://cybercrime.gov.in",
  scores: "https://scores.sebi.gov.in",
  marketIntel: "https://mi.sebi.gov.in",
  sebiCheck: "https://siportal.sebi.gov.in/intermediary/sebi-check",
  sebiUpiCheck: "https://investor.sebi.gov.in/upi-verification.html",
  sebiQrCheck: "https://www.sebi.gov.in/qr-verification.html",
  sebiIntermediaries: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes",
  sebiApps: "https://investor.sebi.gov.in/Investor-support.html",
  sebiFakeAppPoster: "https://investor.sebi.gov.in/beware-fake-trading-app-scam.html",
  scoresFaq: "https://www.sebi.gov.in/sebi_data/faqfiles/oct-2024/1730356475310.pdf",
} as const;

export type LinkKey = keyof typeof LINKS;

/** tel: link for the national cyber crime helpline. On a phone this starts the call. */
export const helplineHref = `tel:${HELPLINE}`;

/** Where the shared message points back to. Set NEXT_PUBLIC_SITE_URL to change it. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://satark-9wxd.onrender.com/";

/** Opens WhatsApp with a ready message. The person picks who gets it, nothing goes to us. */
export function whatsappHref(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
