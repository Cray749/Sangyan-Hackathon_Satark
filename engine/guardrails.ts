// The output guard. It checks words that WE are about to show, never the user's own message.
//
// Hackathon guardrails: no stock tips, no buy/sell/hold, no price predictions, no naming of
// brokers or products, and never telling someone a message is safe. Every template runs
// through this in tests, and any text an AI helper rewrites must pass it at run time too.

export interface GuardHit {
  rule: "tip" | "prediction" | "safe-claim" | "product";
  match: string;
}

const PATTERNS: { rule: GuardHit["rule"]; re: RegExp }[] = [
  // buy, sell or hold advice
  { rule: "tip", re: /\b(?:buy|sell|accumulate|short)\s+(?:now|today|this|these|the|it|shares?|stocks?|before|after)\b/i },
  { rule: "tip", re: /\bhold\s+(?:on\s+to\s+)?(?:these\s+|this\s+|the\s+|your\s+)?(?:shares?|stocks?)\b/i },
  { rule: "tip", re: /\b(?:price\s+)?target\s+(?:price\s+)?(?:of\s+)?(?:rs\.?\s*|₹\s*)?\d/i },
  { rule: "tip", re: /अभी\s*(?:खरीद|बेच)|(?:खरीदें|बेचें)\s*(?:अभी|आज)|आत्ताच\s*(?:खरेदी|विक)|खरेदी\s*करा|विका(?:वे|)\s*आत्ताच/ },
  // saying where a price or an outcome will go
  { rule: "prediction", re: /\b(?:will|going\s+to|expected\s+to|likely\s+to|set\s+to)\s+(?:rise|fall|go\s+up|go\s+down|double|triple|rally|crash|soar|jump)\b/i },
  // telling someone a message is safe or genuine
  { rule: "safe-claim", re: /\b(?:is|are|looks?|seems?|appears?|totally|completely|100\s*%)\s+(?:safe|secure|legit(?:imate)?|genuine|trustworthy|authentic|okay|ok|fine|real)\b/i },
  { rule: "safe-claim", re: /सुरक्षित\s*है|भरोसेमंद\s*है|असली\s*है|ठीक\s*है|सुरक्षित\s*आहे|विश्वासार्ह\s*आहे|खरा\s*आहे|खरी\s*आहे/ },
  // naming a broker or an app
  { rule: "product", re: /\b(?:zerodha|groww|upstox|angel\s*one|5paisa|icici\s*direct|hdfc\s*securities|kotak\s*securities|paytm\s*money|fyers|dhan|sharekhan|motilal)\b/i },
];

export function guardOutput(text: string): { ok: boolean; hits: GuardHit[] } {
  const hits: GuardHit[] = [];
  for (const { rule, re } of PATTERNS) {
    const m = re.exec(text);
    if (m) hits.push({ rule, match: m[0] });
  }
  return { ok: hits.length === 0, hits };
}
