import type { Stage } from "../engine/types";
import type { Expect } from "./types";

// Phrase banks the dataset builder draws from. We wrote these as a scammer or a victim
// would talk, NOT by copying the engine's patterns, and some are deliberately loose
// paraphrases that the rule book may miss. The results show where.
//
// Holes: {amt} {amt2} {pct} {days} {n} {name} {upi} {link} {stock}

export interface ScamPhrase {
  text: string;
  stage: Stage | null;
  /** Defaults to catch. Use flag for a message with only one weak signal. */
  expect?: Expect;
}
export interface VictimPhrase {
  text: string;
  stage: Stage | null;
  expect: Expect;
}
export interface HardPhrase {
  text: string;
  expect: Expect;
}
export interface Bank {
  scam: ScamPhrase[];
  victim: VictimPhrase[];
  genuine: string[];
  hard: HardPhrase[];
  /** Small openers and closers that do not change what the message means. */
  open: string[];
  close: string[];
}

export const en: Bank = {
  open: ["", "", "Hello sir, ", "Hi, ", "Dear investor, ", "Namaste! "],
  close: ["", "", " Reply YES to confirm.", " Message me on WhatsApp.", " Thank you."],
  scam: [
    // stage 1: the hook
    { text: "Join our WhatsApp group where members earn {pct}% guaranteed profit every month. Link: {link}", stage: 1 },
    { text: "Congratulations! You are selected for our VIP stock tips channel. Assured returns, join today {link}", stage: 1 },
    { text: "Invest Rs {amt} with us and get Rs {amt2} in {days} days. Risk free. Message us on WhatsApp.", stage: 1 },
    { text: "I am {name}, a SEBI registered analyst. My clients made Rs {amt2} last week. Join my premium group for sure shot calls.", stage: 1 },
    { text: "Get pre-IPO allotment through our institutional account. Listing gains confirmed. Limited seats.", stage: 1 },
    { text: "Hot tip: {stock} will touch 10x soon, operator backed. Buy before everyone knows. Join {link}", stage: 1, expect: "flag" },
    { text: "Free trading course and mentorship by an ex-banker. Learn to earn daily income. Join the group {link}", stage: 1 },
    { text: "Double your money in {days} days with our fund. Join {link}", stage: 1 },
    { text: "You have been added to the Elite Investors Club group. Fixed monthly returns of {pct}%.", stage: 1 },
    { text: "Our strategy is risk free and has a 99% accuracy. Join the premium channel to get the calls.", stage: 1 },
    { text: "FII sub-account trading with block deals access. Only for selected members. Contact us.", stage: 1 },
    { text: "Celebrity investor Ratan Tata recommends this new platform, watch the video and start today {link}", stage: 1, expect: "flag" },
    // stage 1, looser paraphrases the rule book may miss
    { text: "Our returns are locked in and nothing can go wrong. Come and be a part of the group.", stage: 1 },
    { text: "Capital fully protected, profit sharing every week. Ask for the details on WhatsApp.", stage: 1 },
    // stage 2: trust
    { text: "Check the profit screenshots from our members in the group. Everyone is withdrawing daily. Our analyst {name} is SEBI approved.", stage: 2 },
    { text: "See the payment proof in the group. New success stories every day. You can try a small amount first.", stage: 2, expect: "flag" },
    { text: "We have a SEBI certificate, see it attached. Trusted by 5000 investors.", stage: 2, expect: "flag" },
    { text: "Our member Rakesh earned Rs {amt2} in {days} days, look at his proof screenshot.", stage: 2, expect: "flag" },
    // stage 3: the fake app
    { text: "Download our trading app from this link {link} and open your account by sending Rs {amt} to {upi}.", stage: 3 },
    { text: "Install the APK {link}. After install, deposit Rs {amt} to start trading. Pay to {upi}.", stage: 3 },
    { text: "Our official app is not on the Play Store yet, install this file {link} and login with the code I sent.", stage: 3 },
    { text: "To open your demat account pay Rs {amt} registration fee to {upi}. Then download the app from {link}.", stage: 3 },
    // stage 5: more money
    { text: "Your profit is Rs {amt2}. To unlock the next level you must invest more. Upgrade to the VIP plan today, only {n} slots left.", stage: 5 },
    { text: "We can arrange a loan for you to deposit more. Do not tell your family, they will not understand. Do it today.", stage: 5 },
    { text: "Add Rs {amt} more before 5 pm to keep your bonus. Last chance, the offer ends today.", stage: 5 },
    { text: "Take a loan and deposit Rs {amt} in your trading account, the profit will cover it.", stage: 5 },
    // stage 6: the withdrawal trap
    { text: "Your withdrawal of Rs {amt2} is on hold. Pay {pct}% tax first, then it will be released.", stage: 6 },
    { text: "To withdraw you must clear {pct}% GST and a security deposit of Rs {amt}. Pay to {upi}.", stage: 6 },
    { text: "Account frozen. Pay Rs {amt} unlock fee to release your money.", stage: 6 },
    { text: "Withdrawal failed due to wrong KYC. Pay Rs {amt} verification charges to process it.", stage: 6 },
    { text: "Your money is ready. Before we transfer it you have to deposit {pct}% service tax.", stage: 6 },
    // stage 8: the recovery scam
    { text: "Sir we are a legal team. We can recover your lost money from the scam app. Pay Rs {amt} as advance fee.", stage: 8 },
    { text: "I am an officer from the SEBI cyber cell. Your case is registered. To get your money back deposit Rs {amt} as refund processing charge.", stage: 8 },
    { text: "Fund recovery agents here. We recover money lost in online trading, commission only after recovery, small registration fee first Rs {amt}.", stage: 8 },
    // calls and chats with no stage (login theft, impersonation)
    { text: "This is {name} from your depository. Your demat will be blocked today. Tell me the OTP you received to verify.", stage: null },
    { text: "Sir I am calling from NSDL, your KYC has expired. Share your login ID and password to update it.", stage: null },
    { text: "Download AnyDesk so I can fix the problem in your trading account. Give me the code on your screen.", stage: null },
    { text: "I am a broker executive. To stop the account closure share your user id and the OTP now.", stage: null },
    { text: "{stock} to the moon! Buy now, target 500, this is huge. Insider info, operator backed.", stage: 1, expect: "flag" },
  ],
  victim: [
    { text: "I put in Rs {amt} last week. The app now shows Rs {amt2} profit and my first withdrawal of Rs 5000 worked. Is this real?", stage: 4, expect: "either" },
    { text: "My balance in the app is Rs {amt2}. I withdrew a small amount yesterday and it reached my bank. They want me to add more.", stage: 4, expect: "either" },
    { text: "I deposited Rs {amt} but cannot withdraw. They say I must pay {pct}% tax first. I already paid Rs {amt} once.", stage: 6, expect: "emergency" },
    { text: "My withdrawal is stuck. They are asking for an unlock fee before they release my money. Should I pay?", stage: 6, expect: "emergency" },
    { text: "The app stopped opening and the group admin blocked me. I lost Rs {amt}. What should I do?", stage: 7, expect: "emergency" },
    { text: "I was scammed of Rs {amt}. The website is not working now and nobody replies.", stage: 7, expect: "emergency" },
    { text: "Someone called saying he is a lawyer who can recover my lost Rs {amt} for a fee. Is it true?", stage: 8, expect: "either" },
    { text: "I already paid Rs {amt} to a stranger on a trading group. How do I report this?", stage: null, expect: "emergency" },
  ],
  genuine: [
    "Dear Investor, your Consolidated Account Statement for September is available. To view it, please log in to the official app of your depository.",
    "Your OTP for login is 482913. Do not share it with anyone. Valid for 10 minutes.",
    "Contract note for trades executed on 12 Sep has been sent to your registered email. For any query, contact your broker's support team.",
    "Dividend of Rs 12 per share has been credited to your bank account ending 4321.",
    "Your KYC has been verified successfully. No further action is needed from your side.",
    "Reminder: nomination is optional but recommended. You can update it by logging in to your depository account on the official website.",
    "IPO allotment status is available on the registrar's website. Check it using your application number.",
    "SEBI has issued a circular on UPI handles for registered intermediaries. Please read it on the SEBI website.",
    "Your SIP of Rs 2000 is due on the 5th. Please keep enough balance in your account.",
    "Rs 5,000 debited from your account via UPI to a merchant. If this was not you, call your bank's helpline.",
    "Your mutual fund redemption of Rs 25,000 has been processed and will be credited in 2 working days.",
    "Market update: Sensex closed 120 points lower today. Read the full report on our website.",
    "Your demat account has been successfully opened. Your client ID is sent to your registered email. Never share your password with anyone.",
    "We have updated our privacy policy. You can read it on our official website. No action is required from you.",
    "Quarterly portfolio statement for your mutual fund folio is ready. Mutual fund investments are subject to market risks, read all scheme related documents carefully.",
    "Please note that the market will remain closed on Monday on account of a public holiday.",
  ],
  hard: [
    { text: "Beware of fraudsters promising guaranteed returns. Never share your OTP or pay any fee to withdraw. Report fraud at cybercrime.gov.in.", expect: "clear" },
    { text: "How to check if an investment adviser is registered: search the name on the SEBI website and match the registration number, which looks like INA000012345.", expect: "clear" },
    { text: "SEBI registered mutual funds do not promise fixed returns. Read the scheme document carefully before investing.", expect: "clear" },
    { text: "Hi, how are you? Are you interested in learning about the stock market?", expect: "clear" },
    { text: "Our company is SEBI registered with number INZ000012345. You can open a demat account on our official app.", expect: "clear" },
    { text: "A SIP lets you invest a fixed amount every month. Returns depend on the market and are not guaranteed.", expect: "clear" },
    { text: "Police arrested a gang that cheated investors of Rs 5 crore by promising guaranteed returns through a fake trading app.", expect: "clear" },
    { text: "Scam alert: fake SEBI officers call investors and ask for a fee to release funds. Do not pay. SEBI never asks for money on a call.", expect: "clear" },
    { text: "Common red flags of investment scams are pressure to hurry, guaranteed profits and requests for your OTP.", expect: "clear" },
    { text: "Is it safe to share my demat statement with my tax consultant? He asked for the PDF by email.", expect: "clear" },
    { text: "I am a SEBI registered research analyst INH000099999. Pay Rs {amt} to {upi} for my premium tips.", expect: "catch" },
    { text: "Free demat account opening camp this Sunday at our office, bring your documents. We are a registered broker.", expect: "clear" },
  ],
};
