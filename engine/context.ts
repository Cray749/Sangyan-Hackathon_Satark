import { normalize } from "./normalize";

// Two small checks used by the verdict gate.
//
// 1. Is the text even about money? "No red flags found" is the best answer we give, so we
//    only give it to text that talks about money, investing, an account, a payment or an
//    app. "hi" or "asdf" or a poem tells us nothing, so it can not earn that answer.
// 2. Is the text talking to the checker? Real messages do not tell a scam checker what to
//    say. If someone does, that is a reason for care, never a reason for comfort.

const MONEY_WORDS: RegExp[] = [
  // symbols and units
  /₹|\brs\.?\s?\d|\binr\b|\brupee|\blakh|\bcrore|\d\s?%|\bpercent/,
  // english
  /\binvest|\breturns?\b|\bprofit|\bstocks?\b|\bshares?\b|\btrading|\btrade\b|\bdemat\b|\bmutual fund|\bsip\b|\bipo\b|\bupi\b|\bbank|\baccount|\bwallet|\bpay(ment|ing|s)?\b|\bdeposit|\bwithdraw|\bloan|\bbroker|\bsebi\b|\bnse\b|\bbse\b|\bnsdl\b|\bcdsl\b|\bfund\b|\bmoney|\bcash\b|\bcrypto|\bbitcoin|\bscheme|\bplan\b|\bfee\b|\btax\b|\bpremium|\bbalance|\bstatement/,
  // hindi, marathi and hinglish (nukta is already removed by the cleaner)
  /निवेश|गुंतवणूक|मुनाफा|नफा|फायदा|रिटर्न|रुपये|रुपए|रुपया|रू\.|पैसे|पैसा|पैशां|पैसै|खाता|खाते|खात्य|बैंक|बँक|भुगतान|पेमेंट|देयक|शेयर|समभाग|डीमैट|डिमॅट|ब्रोकर|दलाल|म्यूचुअल|म्युच्युअल|एसआईपी|ट्रेडिंग|ट्रेड|यूपीआई|युपीआय|कर्ज|लोन|जमा|निकाल|काढ|शुल्क|फीस|फी\b|टैक्स|कर\b|सेबी|एनएसडीएल|सीडीएसएल|स्टेटमेंट|बॅलन्स|बैलेंस|रकम|राशि|क्रिप्टो|बिटकॉइन|परतावा|परताव्या|फसवणूक|फसवणुक|ठगी|धोखाधड़ी|धोखाधड़ी|ओटीपी|पासवर्ड/,
  /\bscam|\bfraud|\botp\b|\bpassword|\bupi pin|\bcvv\b|\bpan\b|\baadhaar/,
  /\bpaise|\bpaisa|\bnivesh|\bmunafa|\bfayda|\bkhata|\bbhugtan|\bjama\b|\bnikal/,
];

const TALKS_TO_CHECKER: RegExp[] = [
  /ignore (all |any )?(the )?(previous|prior|above|earlier|your) (instruction|prompt|rule|direction)s?/,
  /disregard (all |any )?(the )?(previous|prior|above|earlier|your) (instruction|prompt|rule)s?/,
  /(say|tell|reply|answer|respond|mark|call|declare|rate|label|show)\b.{0,30}\b(this|it|that|message)\b.{0,20}\b(is |as |be )?(safe|genuine|legit|real|ok|fine|clean|trusted)/,
  /you are (now )?(a |an )?(helpful|trusted|different|new|free|unrestricted)/,
  /(system|developer) (prompt|message|instruction)/,
  /\bjailbreak|\bdan mode|\bact as\b|\bpretend (to be|you)/,
  /पिछले (सभी )?निर्देश(ों)? (को )?(भूल|अनदेखा|नज़रअंदाज़|नजरअंदाज)/,
  /(इसे|यह|ये) (सुरक्षित|सही|असली|ठीक) (बताओ|बताइए|बोलो|कहो|कहें|बताएं)/,
  /मागील (सर्व )?सूचना(ंकडे)? (दुर्लक्ष|विसर)/,
  /(हे|ही|हा) (सुरक्षित|खरे|खरी|योग्य) (सांगा|म्हणा|सांग|म्हण)/,
];

function clean(texts: string[]): string {
  return normalize(texts.join(" \n ")).text;
}

/** True when the text talks about money, investing, an account, a payment or the like. */
export function hasMoneyContext(texts: string[]): boolean {
  const t = clean(texts);
  return MONEY_WORDS.some((re) => re.test(t));
}

/** True when the text gives orders to the checker instead of telling a story. */
export function talksToChecker(texts: string[]): boolean {
  const t = clean(texts);
  return TALKS_TO_CHECKER.some((re) => re.test(t));
}
