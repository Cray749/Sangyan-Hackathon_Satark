// The thing we compare Satark against: a plain keyword filter, the kind of check
// many simple scam detectors use. If any scary word is in the message, it says "scam".
// (The other comparison in the PRD, an AI with no rule gate, needs an API key and is
// reported separately in the Trust Report when a key is available.)

const KEYWORDS = [
  // English
  "guarantee", "assured", "profit", "returns", "vip", "otp", "password", "apk", "fee", "tax",
  "withdraw", "recover", "refund", "pre-ipo", "institutional", "sure shot", "loan", "join", "urgent",
  "risk free", "double", "unlock",
  // Hindi and Marathi
  "गारंटी", "मुनाफ", "ओटीपी", "पासवर्ड", "फीस", "टैक्स", "वीआईपी", "ग्रुप", "परतावा", "नफा", "टॅक्स", "हमी",
  // Hinglish
  "pakka", "pakki", "munafa", "bina risk",
];

export function keywordFilter(text: string): boolean {
  const t = text.toLowerCase();
  return KEYWORDS.some((k) => t.includes(k));
}
