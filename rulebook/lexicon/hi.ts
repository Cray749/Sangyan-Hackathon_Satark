import type { Lexicon } from "./types";

// Hindi (Devanagari) and Hinglish (Hindi typed in English letters).
// Devanagari has no word boundaries for the \b trick, so these patterns use spaces instead.
// The nukta dot and the two nasal dots are cleaned before matching, so one spelling is enough.
const r = String.raw;

// words that show up in a sentence about money, used to keep generic verbs honest
const MONEY = r`[\d₹]|रुपय|रुपए|पैसे|पैसा|यूपीआई|upi|खाते|अकाउंट|क्यूआर|हजार|लाख|paise|paisa|rupay|rs\b|account`;

export const hi: Lexicon = {
  // R01
  assured_returns: [
    { re: r`गारंटी(?:ड|शुदा)?\s*(?:रिटर्न|मुनाफा|कमाई|लाभ|आय|फायदा)`, negatable: true },
    { re: r`(?:रिटर्न|मुनाफा|कमाई|लाभ|फायदा)\s*(?:की\s*)?गारंटी`, negatable: true },
    { re: r`100\s*%\s*(?:गारंटी|पक्का|पक्की|सुनिश्चित|मुनाफा)`, negatable: true },
    { re: r`(?:पक्का|पक्की|निश्चित|तय|सुनिश्चित)\s*(?:मुनाफा|रिटर्न|कमाई|फायदा|लाभ|आय)`, negatable: true },
    { re: r`(?:मुनाफा|रिटर्न|कमाई|फायदा|लाभ)\s*(?:है\s*)?(?:पक्का|पक्की|निश्चित|तय|सुनिश्चित)`, negatable: true },
    { re: r`(?:बिना|बगैर|जीरो)\s*(?:जोखिम|रिस्क)|रिस्क\s*फ्री|जोखिम\s*मुक्त`, negatable: true },
    { re: r`(?:पैसे|पैसा|रकम|निवेश)\s*(?:दोगुना|दुगना|दोगुनी|दुगनी)|(?:दोगुना|दुगना)\s*(?:पैसे|रकम|निवेश|मुनाफा)`, negatable: true },
    { re: r`(?:रोज|रोजाना|प्रतिदिन)\s*[\d,]+\s*(?:रुपये|रुपए|₹)?\s*(?:कमाएं|कमाई|कमाओ|कमाइए)`, negatable: true },
    // Hinglish
    { re: r`\bpakk[ai]\s+(?:profit|return|returns|munafa|kamai|paisa)`, negatable: true },
    { re: r`\b(?:profit|return|returns|munafa)\s+pakk[ai]\b`, negatable: true },
    { re: r`\bguarantee\s+ke\s+saath\b|\bmunafa\s+guarantee\b`, negatable: true },
    { re: r`\bfix(?:ed)?\s+(?:return|returns|profit|munafa)\b`, negatable: true },
    { re: r`\bbina\s+risk\b|\brisk\s*free\b`, negatable: true },
    { re: r`\bdouble\s+paisa\b|\bpaisa\s+double\b|\bpaise\s+double\b`, negatable: true },
    { re: r`\b(?:rozana|roz)\s+(?:kamai|kamaye|kamao|\d)`, negatable: true },
    { re: r`\bdaily\s+(?:kamai|income)\b`, negatable: true },
    { re: r`\b100\s*%\s*(?:pakka|pakki|sure|guarantee)`, negatable: true },
  ],

  // R06
  credential_request: [
    { re: r`(?:ओटीपी|otp|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|यूजर\s*आईडी|यूजर\s*आइडी|क्रेडेंशियल|सीवीवी)\s*(?:और\s*(?:ओटीपी|पासवर्ड|पिन)\s*)?(?:बताएं|बताइए|बताइये|बताओ|भेजें|भेजिए|भेजो|शेयर|साझा|दें|दीजिए|दीजिये|दो)`, negatable: true },
    { re: r`(?:बताएं|बताइए|बताओ|भेजें|भेजिए|शेयर\s*करें|साझा\s*करें|दें|दीजिए)\s+(?:\S+\s+){0,3}?(?:ओटीपी|otp|पासवर्ड|लॉगिन|पिन)`, negatable: true },
    { re: r`(?:ओटीपी|otp|पासवर्ड|पिन|लॉगिन)\s*(?:की\s*)?(?:जरूरत|आवश्यकता|जरूरी|आवश्यक)`, negatable: true },
    { re: r`रिमोट\s*(?:एक्सेस|कंट्रोल)|एनीडेस्क|टीमव्यूअर|टीम\s*व्यूअर|क्विकसपोर्ट` },
    { re: r`(?:अपना|आपका)\s*(?:डीमैट|डिमैट|ट्रेडिंग|लॉगिन)\s*(?:अकाउंट\s*)?(?:पासवर्ड|आईडी|लॉगिन|ओटीपी)`, negatable: true },
    // Hinglish
    { re: r`\b(?:otp|password|pin|login|user\s*id)\s*(?:bata|batao|batana|batayen|batayein|bhej|bhejo|bhejiye|share|de\s*do|dena|dijiye)`, negatable: true },
    { re: r`\b(?:bata|batao|bhej|bhejo|share|de)\s*(?:do\s+)?(?:apna\s+|aapka\s+)?(?:otp|password|pin|login)\b`, negatable: true },
  ],

  // R07
  institutional_offer: [
    { re: r`इंस्टीट्यूशनल|इंस्टिट्यूशनल` },
    { re: r`संस्थागत\s*(?:खाता|अकाउंट|निवेशक|ग्रुप)` },
    { re: r`प्री[\s-]?आईपीओ|एफपीआई|एफआईआई` },
    { re: r`ब्लॉक\s*डील|अपर\s*सर्किट|डब्बा\s*(?:ट्रेडिंग|कारोबार)?` },
    { re: r`आईपीओ\s*(?:का\s*)?(?:अलॉटमेंट|आवंटन)\s*(?:पक्का|गारंटी|सुनिश्चित)` },
    { re: r`बैकडोर|सब[\s-]?अकाउंट` },
  ],

  // R08
  withdraw_fee: [
    {
      re: r`(?:टैक्स|फीस|शुल्क|चार्ज|चार्जेस|जीएसटी|टीडीएस|पेनल्टी|जुर्माना|सिक्योरिटी\s*डिपॉजिट|कमीशन).{0,40}?(?:निकासी|विड्रॉ|विथड्रॉ|निकालने|निकालना|निकाल|रिलीज|अनलॉक|वापस\s*पाने)`,
      also: r`भरें|भरना|जमा|देना|दें|देने|चुकाना|चुकाएं|भुगतान|पेमेंट|जरूरी|आवश्यक|पहले|मांग|पड़ेगा|होगा|लगेगा|चाहिए`,
      negatable: true,
    },
    {
      re: r`(?:निकासी|विड्रॉ|विथड्रॉ|निकालने|निकालना|निकाल|रिलीज|अनलॉक).{0,40}?(?:टैक्स|फीस|शुल्क|चार्ज|जीएसटी|टीडीएस|पेनल्टी|जुर्माना|सिक्योरिटी\s*डिपॉजिट)`,
      also: r`भरें|भरना|जमा|देना|दें|देने|चुकाना|चुकाएं|भुगतान|पेमेंट|जरूरी|आवश्यक|पहले|मांग|पड़ेगा|होगा|लगेगा|चाहिए`,
      negatable: true,
    },
    { re: r`अनलॉक\s*(?:फीस|चार्ज|शुल्क)`, negatable: true },
    // Hinglish
    {
      re: r`\b(?:tax|fee|fees|charge|charges|gst|tds|penalty|security\s+deposit|commission)\b.{0,40}?\b(?:withdraw|withdrawal|nikalne|nikalna|nikaalne|nikal|release|unlock)`,
      also: r`\b(?:bharna|bharo|bhar|jama|dena|do|padega|hoga|lagega|chahiye|pay|paid|deposit|send|required|must|pehle|mang|manga)\b`,
      negatable: true,
    },
    {
      re: r`\b(?:withdraw|withdrawal|nikalne|nikalna|nikaalne|paise\s+nikal\w*|release|unlock)\b.{0,40}?\b(?:tax|fee|fees|charge|charges|gst|tds|penalty)\b`,
      also: r`\b(?:bharna|bharo|bhar|jama|dena|do|padega|hoga|lagega|chahiye|pay|paid|deposit|send|required|must|pehle|mang|manga)\b`,
      negatable: true,
    },
  ],

  // R09 (links with app words are found by shape in extract.ts)
  off_store_app: [
    { re: r`एपीके` },
    { re: r`(?:ऐप|एप|ऍप|एप्लीकेशन|एप्लिकेशन|ऐप्लिकेशन)\s*(?:को\s*)?(?:डाउनलोड|इंस्टॉल)\s*(?:करें|कीजिए|करो|कर\s*लें)?\s*.{0,25}?(?:लिंक|link)` },
    { re: r`(?:लिंक|link)\s*(?:से|पर|के\s*जरिए)\s*.{0,25}?(?:ऐप|एप|ऍप)\s*(?:को\s*)?(?:डाउनलोड|इंस्टॉल)` },
    { re: r`\bapp\s+(?:download|install)\s+(?:kar|karo|kare|karein)\b.{0,25}?\blink\b` },
    { re: r`\blink\s+(?:se|par|pe)\s+.{0,20}?app\s+(?:download|install)` },
  ],

  // R10
  vip_group: [
    { re: r`(?:वीआईपी|वीआइपी|vip|प्रीमियम|इंस्टीट्यूशनल|एक्सक्लूसिव|ऑफिशियल|प्राइम|गोल्ड|प्लेटिनम|डायमंड|एलीट)\s*(?:\S+\s+){0,2}?(?:ग्रुप|चैनल|कम्युनिटी|क्लब)` },
    { re: r`(?:आपको|आप\s*को)\s*(?:\S+\s+){0,6}?(?:ग्रुप|चैनल)\s*(?:में|से)\s*(?:जोड़ा|ऐड|जुड़ा|शामिल)` },
    { re: r`ग्रुप\s*(?:में\s*)?(?:जॉइन|जुड़ें|जुड़िए|ज्वाइन)\s*(?:करें|कीजिए|करो)` },
    { re: r`(?:हमारे|हमारा|मेरे)\s*(?:\S+\s+){0,2}?(?:ग्रुप|चैनल)\s*(?:से|में)\s*(?:जुड़ें|जुड़िए|जॉइन|ज्वाइन)` },
    // Hinglish
    { re: r`\bgroup\s+(?:me|mein|main)\s+(?:add|join|judein|jud)` },
    { re: r`\b(?:aapko|apko|aap\s+ko)\s+.{0,25}?group\s+(?:me|mein)\s+add` },
    { re: r`\bgroup\s+join\s+(?:kare|karo|karein)\b` },
  ],

  // R11 (the secrecy phrases are the red flag, so they are NOT negatable)
  urgency_secrecy: [
    { re: r`जल्दी\s*(?:करें|कीजिए|करो)` },
    { re: r`अभी\s*(?:जॉइन|ज्वाइन|निवेश|पेमेंट|जमा|इन्वेस्ट)` },
    { re: r`सीमित\s*(?:स्लॉट|सीट|सीटें|समय|ऑफर|जगह)` },
    { re: r`आज\s*ही\s*(?:जॉइन|ज्वाइन|निवेश|जमा|पेमेंट|रजिस्टर|करें)` },
    { re: r`आखिरी\s*(?:मौका|दिन)` },
    { re: r`(?:सिर्फ|केवल)\s*\d+\s*(?:स्लॉट|सीटें?)\s*(?:बचे|बाकी)` },
    { re: r`(?:किसी|कीसी)\s*को\s*(?:भी\s*)?(?:मत|न)\s*बता`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`(?:घर|परिवार)\s*(?:वालों|के\s*लोगों)?\s*को\s*(?:मत|न)\s*बता`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`गोपनीय\s*रखें|राज\s*रखें`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`ऑफर\s*(?:खत्म|समाप्त)` },
    // Hinglish
    { re: r`\bjaldi\s+(?:kar|karo|kare|karein)` },
    { re: r`\babhi\s+(?:join|invest|pay|karo|kare|jama|deposit)` },
    { re: r`\baaj\s+hi\s+(?:join|invest|jama|pay|register)` },
    { re: r`\bkisi\s+ko\s+(?:bhi\s+)?(?:mat|na)\s+bata`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`\bghar\s*(?:walon|wale|walo)\s+ko\s+(?:mat|na)\s+bata`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`\bsecret\s+rakh|\boffer\s+(?:khatam|expire)`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
  ],

  // R12
  profit_proof: [
    { re: r`(?:प्रॉफिट|प्रोफिट|मुनाफे?|कमाई)\s*(?:का|के|की)\s*(?:स्क्रीनशॉट|सबूत|प्रूफ)` },
    { re: r`(?:प्रॉफिट|प्रोफिट)\s*(?:स्क्रीनशॉट|प्रूफ)` },
    { re: r`(?:स्क्रीनशॉट|सबूत)\s*(?:देखें|देखो|देखिए)` },
    { re: r`(?:सदस्यों|मेंबर्स|मेंबरों|ग्राहकों)\s*ने\s*(?:\S+\s+){0,3}?कमाए` },
    { re: r`सक्सेस\s*स्टोरी|लाखों\s*(?:कमाए|कमा)` },
    // Hinglish
    { re: r`\bprofit\s+(?:screenshot|proof)` },
    { re: r`\b(?:munafe|kamai)\s+ka\s+(?:screenshot|proof)` },
    { re: r`\bscreenshot\s+dekh` },
    { re: r`\bmembers\s+ne\s+(?:\w+\s+)?(?:kamaye|kamaya|kamai)` },
  ],

  // R13
  refund_fee: [
    {
      re: r`(?:पैसे|पैसा|रकम|राशि|धन)\s*(?:वापस|रिकवर|लौटा)`,
      also: r`फीस|शुल्क|चार्ज|कमीशन|एडवांस|जमा|भुगतान|पेमेंट|प्रोसेसिंग|टैक्स|जीएसटी`,
      negatable: true,
    },
    {
      re: r`(?:डूबे|फंसे|खोए|लुटे)\s*(?:हुए\s*)?(?:पैसे|पैसा|रकम)\s*(?:वापस|निकल|रिकवर)`,
      also: r`फीस|शुल्क|चार्ज|कमीशन|एडवांस|जमा|भुगतान|पेमेंट|प्रोसेसिंग|टैक्स|जीएसटी`,
      negatable: true,
    },
    { re: r`रिकवरी\s*(?:एजेंट|एजेंसी|वकील|टीम|सर्विस|सेवा|एक्सपर्ट|कंपनी)`, negatable: true },
    { re: r`वकील.{0,50}?(?:पैसे|रकम|राशि)\s*वापस`, negatable: true },
    // Hinglish
    {
      re: r`\b(?:paise|paisa|raqam|amount)\s+(?:wapas|vapas|recover|return)`,
      also: r`\b(?:fee|charge|charges|commission|advance|deposit|pay|payment|processing|tax|gst)\b`,
      negatable: true,
    },
    {
      re: r`\b(?:dube|fase|khoye)\s+(?:hue\s+)?(?:paise|paisa)\s+(?:wapas|vapas)`,
      also: r`\b(?:fee|charge|charges|commission|advance|deposit|pay|payment|processing|tax|gst)\b`,
      negatable: true,
    },
  ],

  // R14
  official_impersonation: [
    {
      re: r`(?:सेबी|एनएसडीएल|सीडीएसएल|डिपॉजिटरी|एनएसई|बीएसई|आरबीआई|ब्रोकर|स्टॉक\s*एक्सचेंज)\s*(?:के\s*)?(?:अधिकारी|ऑफिसर|ऑफिशियल|मैनेजर|एग्जीक्यूटिव|प्रतिनिधि|विभाग|इंस्पेक्टर)`,
      also: r`पैसे|फीस|जुर्माना|पेनल्टी|लॉगिन|पासवर्ड|ओटीपी|otp|वेरिफाई|केवाईसी|बंद|ब्लॉक|सस्पेंड|फ्रीज|शेयर|भेज|जमा|बताएं|बताइए|कार्रवाई|डिटेल`,
    },
    {
      re: r`(?:मैं|हम|यह)\s*(?:\S+\s+){0,2}?(?:सेबी|एनएसडीएल|सीडीएसएल|डिपॉजिटरी)\s*(?:से|की\s*तरफ\s*से)\s*(?:बोल|बात|कॉल)`,
      also: r`पैसे|फीस|जुर्माना|पेनल्टी|लॉगिन|पासवर्ड|ओटीपी|otp|वेरिफाई|केवाईसी|बंद|ब्लॉक|सस्पेंड|फ्रीज|शेयर|भेज|जमा|बताएं|बताइए|कार्रवाई|डिटेल`,
    },
    // Hinglish
    {
      re: r`\b(?:main|mai|hum)\s+(?:\w+\s+){0,2}?(?:sebi|nsdl|cdsl|depository)\s+(?:se|ki\s+taraf\s+se)\s+(?:bol|baat|call)`,
      also: r`\b(?:paisa|paise|fee|login|password|otp|verify|kyc|band|block|jurmana|penalty|share|bhej|jama|bata)`,
    },
  ],

  // R15
  celebrity_endorsement: [
    { re: r`(?:एआई|ए\s*आई|डीपफेक)\s*(?:से\s*बना\s*)?वीडियो` },
    {
      re: r`(?:रतन\s*टाटा|मुकेश\s*अंबानी|मुकेश\s*अम्बानी|गौतम\s*अडानी|एलन\s*मस्क|निर्मला\s*सीतारमण|नारायण\s*मूर्ति|सुधा\s*मूर्ति|आनंद\s*महिंद्रा|सद्गुरु|अमिताभ\s*बच्चन|विराट\s*कोहली|धोनी|सचिन\s*तेंदुलकर|शाहरुख\s*खान|अक्षय\s*कुमार|नरेंद्र\s*मोदी|मोदी\s*जी).{0,50}?(?:निवेश|प्लेटफॉर्म|ऐप|एप|स्कीम|योजना|ट्रेडिंग|सलाह|सिफारिश|लॉन्च|राज|सीक्रेट)`,
    },
    {
      re: r`\b(?:ratan\s+tata|mukesh\s+ambani|elon\s+musk|nirmala\s+sitharaman|narayana\s+murthy|amitabh\s+bachchan|virat\s+kohli|narendra\s+modi)\b.{0,60}?\b(?:nivesh|salah|raaz|secret|platform|app|scheme)\b`,
    },
  ],

  // R16
  invest_more: [
    { re: r`(?:और|ज्यादा|अधिक|बड़ा|बड़ी)\s*(?:पैसे|पैसा|रकम|राशि|निवेश|डिपॉजिट)\s*(?:लगाएं|लगाओ|जमा|डालें|डालो|करें|कीजिए)` },
    { re: r`निवेश\s*(?:बढ़ाएं|बढ़ाओ|बढ़ाइए|बढाएं|बढ़ाना)` },
    { re: r`(?:लोन|उधार|कर्ज)\s*(?:लेकर|लेके|ले\s*कर)\s*(?:निवेश|जमा|इन्वेस्ट|पैसे)` },
    { re: r`(?:हम|कंपनी|मैं)\s*(?:आपको\s*)?(?:लोन|उधार|कर्ज)\s*(?:देंगे|दे\s*सकते|दिलवा|देगी)` },
    { re: r`(?:वीआईपी|प्रीमियम|गोल्ड|प्लेटिनम|डायमंड)\s*(?:प्लान\s*)?(?:में\s*)?अपग्रेड` },
    { re: r`अगला\s*लेवल\s*(?:अनलॉक|खोलने)` },
    // Hinglish
    { re: r`\b(?:aur|zyada|ek\s+aur)\s+(?:paisa|paise|invest|deposit)\s*(?:lagao|lagayen|lagaye|daalo|dalo|jama|karo|kare)` },
    { re: r`\binvest\s+(?:aur\s+)?badha` },
    { re: r`\bloan\s+(?:le\s+ke|lekar|leke)\s+(?:invest|deposit|paise)` },
    { re: r`\bhum\s+(?:aapko\s+)?loan\s+(?:denge|de\s+sakte)` },
    { re: r`\bupgrade\s+(?:karo|kare|karein)\b` },
  ],

  // R17
  hype_words: [
    { re: r`मल्टीबैगर|रॉकेट|जैकपॉट\s*स्टॉक|पेनी\s*स्टॉक` },
    { re: r`अभी\s*खरीद(?:ें|ो|ना)?` },
    { re: r`टारगेट\s*(?:रु\.?|₹)?\s*\d+` },
    { re: r`इनसाइडर\s*(?:टिप|खबर|जानकारी)|ऑपरेटर\s*(?:कॉल|टिप|स्टॉक)` },
    { re: r`\d+\s*गुना\s*(?:रिटर्न|मुनाफा|फायदा)|चांद\s*पर` },
    // Hinglish
    { re: r`\bbuy\s+kar\s+lo\b|\babhi\s+buy\b` },
    { re: r`\b\d+x\s+return` },
  ],

  // R18
  fake_cert_or_course: [
    { re: r`(?:ट्रेडिंग|शेयर\s*बाजार|स्टॉक\s*मार्केट|ऑप्शन)\s*(?:का\s*)?(?:कोर्स|क्लास|क्लासेस|मेंटरशिप|वेबिनार|वर्कशॉप|कोचिंग|ट्रेनिंग)` },
    { re: r`फ्री\s*(?:ट्रेडिंग\s*)?(?:कोर्स|वेबिनार|मास्टरक्लास|क्लास|मेंटरशिप)` },
    { re: r`सेबी\s*(?:का\s*)?(?:प्रमाणपत्र|सर्टिफिकेट|लाइसेंस|अनुमोदन)` },
    { re: r`मेंटरशिप\s*(?:प्रोग्राम|ग्रुप)` },
  ],

  registered_claim: [
    { re: r`सेबी\s*(?:से\s*)?(?:पंजीकृत|रजिस्टर्ड|रजिस्टर|अनुमोदित|मान्यता\s*प्राप्त|प्रमाणित|लाइसेंस\s*प्राप्त)` },
    { re: r`सेबी\s*द्वारा\s*(?:पंजीकृत|मान्यता\s*प्राप्त|अनुमोदित)` },
    { re: r`(?:पंजीकृत|रजिस्टर्ड)\s*(?:निवेश\s*सलाहकार|रिसर्च\s*एनालिस्ट|ब्रोकर|सलाहकार)` },
    { re: r`\bsebi\s+se\s+(?:registered|approved|certified|mili)` },
  ],

  payment_request: [
    { re: r`(?:₹|रु\.?|रुपये|रुपए|हजार|लाख)\s*[\d,]*.{0,25}?(?:भेजें|भेजो|भेजिए|जमा|ट्रांसफर|पे\s*करें|डालें|लगाएं)`, negatable: true },
    { re: r`(?:यूपीआई|upi|खाते|अकाउंट|क्यूआर)\s*.{0,25}?(?:भेजें|जमा|ट्रांसफर|पेमेंट|पे\s*करें)`, negatable: true },
    { re: r`[\d,]+\s*(?:रुपये|रुपए|हजार|लाख|रु)?\s*(?:में|पर|को)?\s*(?:भेजें|जमा\s*करें|ट्रांसफर\s*करें|पे\s*करें|डालें)`, negatable: true },
    { re: r`अकाउंट\s*(?:खोलने|खुलवाने)\s*के\s*लिए` },
    { re: r`(?:रजिस्ट्रेशन|जॉइनिंग|एक्टिवेशन|प्रोसेसिंग|केवाईसी|मेंबरशिप)\s*(?:फीस|शुल्क|चार्ज|राशि)`, negatable: true },
    { re: r`क्यूआर\s*(?:कोड\s*)?स्कैन|न्यूनतम\s*(?:जमा|निवेश|डिपॉजिट)` },
    // Hinglish: the verb alone is too common, so a money word must be in the sentence
    {
      re: r`\b(?:bhejo|bhej\s+do|bhejiye|jama\s+karo|jama\s+kare|transfer\s+karo|pay\s+karo|payment\s+karo|paise\s+bhej|paise\s+daalo|invest\s+karo)\b`,
      also: MONEY,
      negatable: true,
    },
  ],

  bank_account: [
    { re: r`आईएफएससी` },
    { re: r`खाता\s*(?:नंबर|संख्या)|अकाउंट\s*(?:नंबर|नं\.?)` },
  ],

  fake_profit_shown: [
    { re: r`(?:ऐप|एप|अकाउंट|वॉलेट|डैशबोर्ड)\s*(?:में|पर)\s*(?:मुनाफा|प्रॉफिट|प्रोफिट|फायदा|बैलेंस|रिटर्न)\s*(?:दिख|दिखा)` },
    { re: r`(?:मुनाफा|प्रॉफिट|बैलेंस)\s*दिख` },
    { re: r`(?:मैंने|मैने|हमने)\s*(?:\S+\s+){0,3}?(?:निकाले|निकाला|विड्रॉ|निकाल\s*लिए|निकाल\s*लिया)`, negatable: true },
    { re: r`पहली\s*बार\s*(?:में\s*)?(?:पैसे\s*)?निकाल|छोटी\s*(?:रकम|राशि)\s*(?:निकाल|विड्रॉ)` },
    { re: r`(?:मेरा|मेरे)\s*(?:बैलेंस|प्रॉफिट|मुनाफा)` },
    // Hinglish
    { re: r`\bprofit\s+dikh|\bbalance\s+dikh|\bmera\s+(?:balance|profit)` },
    { re: r`\b(?:maine|mene)\s+(?:\w+\s+){0,3}?withdraw\s+(?:kiya|kar\s+liya|kar\s+liye)` },
    { re: r`\bpehli\s+baar\s+(?:me\s+)?(?:paise\s+)?nikal|\bchh?ota\s+withdrawal` },
  ],

  app_blocked_or_gone: [
    { re: r`(?:ऐप|एप|वेबसाइट|साइट|ग्रुप|चैनल|अकाउंट|नंबर)\s*(?:अचानक\s*)?(?:बंद|डिलीट|गायब|ब्लॉक|हट|काम\s*नहीं|स्विच\s*ऑफ)` },
    { re: r`(?:ऐप|एप)\s*(?:खुल\s*नहीं|नहीं\s*खुल)` },
    { re: r`(?:मुझे|मुझको)\s*(?:ब्लॉक|हटा)` },
    { re: r`कोई\s*जवाब\s*नहीं` },
    // Hinglish
    { re: r`\bapp\s+(?:band|delete|gayab|nahi\s+khul)` },
    { re: r`\bgroup\s+(?:delete|band)|\bblock\s+kar\s+diya|\bnumber\s+(?:band|switch\s+off)` },
  ],

  money_sent: [
    { re: r`(?:मैंने|मैने|हमने)\s*(?:\S+\s+){0,4}?(?:भेज\s*दिए|भेज\s*दिया|भेज\s*दी|जमा\s*कर\s*दिए|जमा\s*कर\s*दिया|जमा\s*कर\s*दी|दे\s*दिए|दे\s*दिया|ट्रांसफर\s*कर\s*दिए|ट्रांसफर\s*कर\s*दिया|पे\s*कर\s*दिया|लगा\s*दिए|लगा\s*दिया|निवेश\s*कर\s*दिया|डाल\s*दिए|डाल\s*दिया)` },
    { re: r`पैसे\s*(?:कट|डूब|फंस|चले\s*गए)` },
    { re: r`ठगी\s*(?:हो\s*गई|का\s*शिकार)|(?:ठगा|धोखा)\s*(?:गया|गई|हुआ|हो\s*गया)|धोखाधड़ी\s*हो\s*गई` },
    { re: r`पैसे\s*भेज\s*चुका|(?:रुपये|रुपए|₹)\s*[\d,]+\s*(?:भेज|जमा|दे)\s*(?:दिए|दिया|चुका|चुके)` },
    // Hinglish
    { re: r`\bmaine\s+(?:\w+\s+){0,4}?(?:bhej\s+diye|bhej\s+diya|jama\s+kar\s+diya|jama\s+kiya|jama\s+kar\s+diye|pay\s+kar\s+diya|transfer\s+kar\s+diya|lagaya|lagaye)` },
    { re: r`\bpaise\s+(?:kat|dub|fas|chale\s+gaye)|\bthagi\s+ho\s+gayi|\bscam\s+ho\s+gaya|\bdhokha\s+ho\s+gaya` },
  ],

  registered_entity_grievance: [
    { re: r`(?:मेरे|मेरा)\s*(?:ब्रोकर|डीपी|म्यूचुअल\s*फंड|डीमैट|डिमैट)\s*(?:ने|का|नहीं)` },
    { re: r`(?:ब्रोकर|म्यूचुअल\s*फंड|डीपी)\s*के\s*खिलाफ\s*शिकायत|शिकायत\s*निवारण` },
  ],

  warning_cue: [
    { re: r`सावधान|चेतावनी|जागरूक|कैसे\s*पहचानें|रेड\s*फ्लैग` },
    { re: r`सतर्क\s*रहें|झांसे\s*में\s*न\s*आएं|स्कैम\s*अलर्ट` },
    { re: r`(?:धोखाधड़ी|ठगी|फ्रॉड|स्कैम)\s*से\s*बचें` },
    { re: r`(?:ठग|ठगों|धोखेबाज|धोखेबाजों)\s*(?:से|ऐसे|अक्सर|आम)` },
    { re: r`सेबी\s*(?:ने\s*)?(?:चेतावनी|आगाह|सावधान)` },
    // Hinglish
    { re: r`\bsavdhan\b|\bjagruk\b|\bscam\s+alert\b` },
    { re: r`\bsatark\s+rah|\bjhanse\s+(?:me|mein)\s+na\s+aa|\bkaise\s+pehchan` },
    { re: r`\b(?:dhokhadhadi|thagi|fraud|scam)\s+se\s+bach` },
  ],
};
