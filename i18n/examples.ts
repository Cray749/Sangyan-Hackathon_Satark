import type { Lang, Stage, VerdictLevel } from "../engine/types";

// Messages people can tap to try Satark. They are also the first cases in our test set.
// Each one is checked in a test, so an example can never show a surprise verdict.

export type ExampleId = "invite" | "tax" | "officer" | "notice" | "warning";

export interface Example {
  id: ExampleId;
  label: string;
  text: string;
  expect: { level: VerdictLevel; stage: Stage | null };
}

type Text = Record<ExampleId, { label: string; text: string }>;

const EXPECT: Record<ExampleId, Example["expect"]> = {
  invite: { level: "stop", stage: 3 },
  tax: { level: "stop", stage: 6 },
  officer: { level: "stop", stage: null },
  notice: { level: "no_flags", stage: null },
  warning: { level: "no_flags", stage: null },
};

const hi: Text = {
  invite: {
    label: "ग्रुप का न्योता",
    text: "आपको 'VIP Institutional Gold' ग्रुप में जोड़ा गया है। यहाँ गारंटीड रिटर्न मिलता है, रोज़ 3% पक्का मुनाफा। हमारा ऐप इस लिंक से डाउनलोड करें https://win-big.xyz/satark.apk और अकाउंट खोलने के लिए 5000 रुपये rajesh1234@oksbi पर भेजें। सिर्फ़ आज, सीमित स्लॉट।",
  },
  tax: {
    label: "पैसे निकालने पर टैक्स",
    text: "मुझे पैसे निकालने हैं पर ऐप कह रहा है कि 90,000 रुपये निकालने के लिए पहले 20% टैक्स जमा करना होगा।",
  },
  officer: {
    label: "अधिकारी का फ़ोन",
    text: "मैं डिपॉजिटरी अधिकारी बोल रहा हूँ। आपका डीमैट खाता आज बंद हो जाएगा। बचाने के लिए अपना लॉगिन आईडी और ओटीपी बताइए।",
  },
  notice: {
    label: "असली जैसा स्टेटमेंट ईमेल",
    text: "प्रिय निवेशक, सितंबर महीने का आपका डीमैट स्टेटमेंट तैयार है। कृपया इसे देखने के लिए आधिकारिक ऐप में लॉग इन करें। अपना ओटीपी या पासवर्ड किसी के साथ साझा न करें।",
  },
  warning: {
    label: "चेतावनी वाली पोस्ट",
    text: "सावधान! ठग अक्सर गारंटीड रिटर्न का वादा करके पैसे निकालने के लिए टैक्स माँगते हैं। ऐसे झांसे में न आएं और अपना ओटीपी कभी साझा न करें।",
  },
};

const mr: Text = {
  invite: {
    label: "ग्रुपचे आमंत्रण",
    text: "तुम्हाला 'VIP Institutional Gold' ग्रुप मध्ये जोडले आहे. इथे खात्रीशीर परतावा मिळतो, रोज 3% नफा. आमचे ॲप या लिंकवरून डाउनलोड करा https://win-big.xyz/satark.apk आणि खाते उघडण्यासाठी 5000 रुपये rajesh1234@oksbi वर पाठवा. फक्त आजच, मर्यादित जागा.",
  },
  tax: {
    label: "पैसे काढताना टॅक्स",
    text: "मला पैसे काढायचे आहेत पण ॲप सांगतंय की 90,000 रुपये काढण्यासाठी आधी 20% टॅक्स भरावा लागेल.",
  },
  officer: {
    label: "अधिकाऱ्याचा फोन",
    text: "मी डिपॉझिटरी कडून बोलतो. तुमचे डिमॅट खाते आज बंद होईल. वाचवण्यासाठी तुमचा लॉगिन आयडी आणि ओटीपी सांगा.",
  },
  notice: {
    label: "खऱ्यासारखा स्टेटमेंट ईमेल",
    text: "प्रिय गुंतवणूकदार, सप्टेंबर महिन्याचे तुमचे डिमॅट स्टेटमेंट तयार आहे. ते पाहण्यासाठी कृपया अधिकृत ॲपमध्ये लॉग इन करा. तुमचा ओटीपी किंवा पासवर्ड कोणालाही सांगू नका.",
  },
  warning: {
    label: "इशारा देणारी पोस्ट",
    text: "सावध रहा! फसवणूक करणारे अनेकदा खात्रीशीर परताव्याचे वचन देतात. अशा जाळ्यात अडकू नका आणि तुमचा ओटीपी कधीही शेअर करू नका.",
  },
};

const en: Text = {
  invite: {
    label: "A group invite",
    text: "You have been added to the 'VIP Institutional Gold' group. Guaranteed returns here, 3% profit daily. Download our app from this link https://win-big.xyz/satark.apk and send 5000 rupees to rajesh1234@oksbi to open your account. Today only, limited slots.",
  },
  tax: {
    label: "Tax to withdraw",
    text: "The app says I must pay a 20% tax before I can withdraw my 90,000 rupees.",
  },
  officer: {
    label: "A call from an officer",
    text: "I am a depository officer. Your demat account will be closed today. To save it, share your login ID and OTP now.",
  },
  notice: {
    label: "A real-looking statement email",
    text: "Dear investor, your monthly demat statement for September is ready. Please log in to the official app to view it. Do not share your OTP or password with anyone.",
  },
  warning: {
    label: "A warning post",
    text: "Beware! Fraudsters promise guaranteed returns and ask for a tax to let you withdraw. Do not fall for it and never share your OTP.",
  },
};

const ORDER: ExampleId[] = ["invite", "tax", "officer", "notice", "warning"];
const byLang: Record<Lang, Text> = { hi, mr, en };

export function examples(lang: Lang): Example[] {
  return ORDER.map((id) => ({ id, ...byLang[lang][id], expect: EXPECT[id] }));
}
