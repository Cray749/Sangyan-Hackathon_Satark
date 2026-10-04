import { describe, expect, it } from "vitest";
import { extractFacts } from "./extract";
import type { FactKind } from "./types";

const kinds = (t: string): FactKind[] => [...new Set(extractFacts(t).map((f) => f.kind))];
const has = (t: string, k: FactKind) => kinds(t).includes(k);

describe("extractor, Hindi", () => {
  it("R01 पक्का मुनाफा और गारंटी", () => {
    expect(has("हमारे साथ जुड़ें, पक्का मुनाफा मिलेगा", "assured_returns")).toBe(true);
    expect(has("गारंटीड रिटर्न हर महीने", "assured_returns")).toBe(true);
    expect(has("बिना रिस्क के कमाई", "assured_returns")).toBe(true);
  });

  it("R06 ओटीपी या पासवर्ड माँगना (Mr. Sharma's call)", () => {
    expect(has("मैं डिपॉजिटरी अधिकारी बोल रहा हूँ, अपना लॉगिन बताइए वरना डीमैट बंद हो जाएगा", "credential_request")).toBe(true);
    expect(has("अपना OTP बताएं", "credential_request")).toBe(true);
    expect(has("पासवर्ड भेजिए", "credential_request")).toBe(true);
  });

  it("R14 अधिकारी बनकर बात करना", () => {
    expect(has("मैं डिपॉजिटरी अधिकारी हूँ, आपका डीमैट बंद होगा, लॉगिन बताइए", "official_impersonation")).toBe(true);
    expect(has("सेबी ऑफिसर बोल रहा हूँ, जुर्माना भरना होगा", "official_impersonation")).toBe(true);
  });

  it("R08 पैसे निकालने के लिए टैक्स (Priya)", () => {
    expect(has("पैसे निकालने के लिए 20% टैक्स देना होगा", "withdraw_fee")).toBe(true);
    expect(has("विड्रॉ करने के लिए पहले जीएसटी जमा करें", "withdraw_fee")).toBe(true);
  });

  it("R10 वीआईपी ग्रुप (Ramesh)", () => {
    expect(has("आपको वीआईपी इंस्टीट्यूशनल ग्रुप में जोड़ा गया है", "vip_group")).toBe(true);
  });

  it("R07 इंस्टीट्यूशनल अकाउंट और प्री आईपीओ", () => {
    expect(has("इंस्टीट्यूशनल अकाउंट खोलें", "institutional_offer")).toBe(true);
    expect(has("प्री आईपीओ शेयर मिलेंगे", "institutional_offer")).toBe(true);
  });

  it("R11 जल्दी करें और किसी को मत बताएं", () => {
    expect(has("सीमित स्लॉट हैं, जल्दी करें", "urgency_secrecy")).toBe(true);
    expect(has("यह बात किसी को मत बताएं", "urgency_secrecy")).toBe(true);
  });

  it("R12 प्रॉफिट का स्क्रीनशॉट", () => {
    expect(has("देखिए प्रॉफिट का स्क्रीनशॉट", "profit_proof")).toBe(true);
  });

  it("R13 पैसे वापस दिलाने के लिए फीस", () => {
    expect(has("आपके डूबे हुए पैसे वापस मिलेंगे, बस प्रोसेसिंग फीस जमा करें", "refund_fee")).toBe(true);
    expect(has("हमारी रिकवरी टीम पैसे वापस दिलाएगी", "refund_fee")).toBe(true);
  });

  it("R16 और पैसे लगाएं, लोन देंगे", () => {
    expect(has("और पैसे लगाएं तभी अगला लेवल खुलेगा", "invest_more")).toBe(true);
    expect(has("हम आपको लोन देंगे, निवेश करें", "invest_more")).toBe(true);
  });

  it("R17 मल्टीबैगर और टारगेट", () => {
    expect(has("अगला मल्टीबैगर, टारगेट 500", "hype_words")).toBe(true);
  });

  it("clues: पैसे भेज दिए, ऐप बंद, मुनाफा दिख रहा", () => {
    expect(has("मैंने 80000 रुपये भेज दिए", "money_sent")).toBe(true);
    expect(has("मेरे साथ ठगी हो गई", "money_sent")).toBe(true);
    expect(has("ऐप बंद हो गया और ग्रुप डिलीट", "app_blocked_or_gone")).toBe(true);
    expect(has("ऐप में मुनाफा दिख रहा है", "fake_profit_shown")).toBe(true);
    expect(has("सेबी से पंजीकृत सलाहकार", "registered_claim")).toBe(true);
  });

  it("works with Devanagari digits and either nukta spelling", () => {
    expect(has("मुनाफ़ा पक्का", "assured_returns")).toBe(true);
    expect(has("मैंने ९०००० रुपये भेज दिए", "money_sent")).toBe(true);
  });
});

describe("extractor, Hindi: warnings and advice are not flagged", () => {
  it("does not flag 'कभी ओटीपी साझा न करें'", () => {
    expect(has("कभी भी अपना ओटीपी साझा न करें", "credential_request")).toBe(false);
    expect(has("अपना पासवर्ड किसी को न बताएं", "credential_request")).toBe(false);
  });

  it("does not flag 'कोई गारंटी नहीं'", () => {
    expect(has("म्यूचुअल फंड में रिटर्न की कोई गारंटी नहीं होती", "assured_returns")).toBe(false);
  });

  it("sees a warning cue", () => {
    expect(has("सावधान! ठगों से बचें", "warning_cue")).toBe(true);
  });
});

describe("extractor, Hinglish", () => {
  it("R01 pakka profit", () => {
    expect(has("pakka profit milega, bina risk", "assured_returns")).toBe(true);
    expect(has("daily kamai guarantee ke saath", "assured_returns")).toBe(true);
  });

  it("R06 otp bhejo", () => {
    expect(has("apna otp bhejo abhi", "credential_request")).toBe(true);
    expect(has("password bata do", "credential_request")).toBe(true);
  });

  it("R08 withdraw ke liye tax", () => {
    expect(has("paise nikalne ke liye 20% tax dena padega", "withdraw_fee")).toBe(true);
    expect(has("withdraw karne se pehle GST bharo", "withdraw_fee")).toBe(true);
  });

  it("R11 kisi ko mat batana", () => {
    expect(has("ye baat kisi ko mat batana, jaldi karo", "urgency_secrecy")).toBe(true);
  });

  it("R13 paise wapas dilane ka fee", () => {
    expect(has("aapke paise wapas milenge, sirf fee jama karo", "refund_fee")).toBe(true);
  });

  it("clues: bhej diye, thagi ho gayi", () => {
    expect(has("maine 50000 bhej diye", "money_sent")).toBe(true);
    expect(has("mere saath thagi ho gayi", "money_sent")).toBe(true);
    expect(has("profit dikh raha hai app me", "fake_profit_shown")).toBe(true);
  });

  it("does not take a plain 'bhejo' as a payment request", () => {
    expect(has("screenshot bhejo", "payment_request")).toBe(false);
    expect(has("5000 rupay bhejo", "payment_request")).toBe(true);
  });
});
