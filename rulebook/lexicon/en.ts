import type { Lexicon } from "./types";

// English phrases. Patterns run on lower-case text, so write them in lower case.
const r = String.raw;

export const en: Lexicon = {
  // R01
  assured_returns: [
    // looser ways of saying "you cannot lose"
    { re: r`capital\s+(?:is\s+)?(?:fully\s+|100\s*%\s+)?(?:protected|secure[d]?)`, negatable: true },
    { re: r`(?:returns?|profits?)\s+(?:are\s+)?locked[\s-]?in|nothing\s+can\s+go\s+wrong`, negatable: true },
    { re: r`\b(?:no|zero)\s+(?:loss|losses)\b|\bloss[\s-]?free\b`, negatable: true },
    { re: r`guarantee[ds]?\s+(?:daily\s+|monthly\s+|weekly\s+|fixed\s+)?(?:returns?|profits?|income|gains?|earnings?)`, negatable: true },
    { re: r`(?:assured|certain|fixed|sure|definite)\s+(?:daily\s+|monthly\s+|weekly\s+)?(?:returns?|profits?|income|gains?)`, negatable: true },
    { re: r`(?:returns?|profits?|income)\s+(?:are\s+|is\s+)?guaranteed`, negatable: true },
    { re: r`\b(?:100|99)\s*%\s*(?:sure|guaranteed|profit|success|accura(?:te|cy)|safe)`, negatable: true },
    { re: r`risk[\s-]?free\s+(?:returns?|profits?|trading|investments?|income)`, negatable: true },
    { re: r`sure[\s-]?shot`, negatable: true },
    { re: r`double\s+your\s+(?:money|investment)`, negatable: true },
    { re: r`\d+\s*%\s*(?:daily|weekly|per\s+day|per\s+week|every\s+day)\b`, negatable: true },
    { re: r`earn\s+(?:rs\.?\s*|₹\s*)?\d[\d,]*\s*(?:daily|per\s+day|every\s+day)`, negatable: true },
  ],

  // R06
  credential_request: [
    { re: r`(?:share|send|give|tell|provide|enter|submit|forward|read\s+out)\s+(?:me\s+|us\s+)?(?:your\s+|the\s+|ur\s+)?(?:login|log-in|user\s*id|username|password|passcode|pin|otp|mpin|cvv|demat\s+(?:login|password|pin)|trading\s+(?:id|password|pin))`, negatable: true },
    { re: r`(?:otp|password|pin|login\s+(?:id|details?)|credentials?)\s+(?:is\s+|are\s+)?(?:required|needed|necessary|must|mandatory)`, negatable: true },
    { re: r`\bremote\s+access\b`, negatable: true },
    { re: r`\b(?:anydesk|teamviewer|quicksupport|rustdesk|airdroid)\b` },
    { re: r`(?:verify|update|confirm)\s+(?:your\s+)?(?:demat|kyc|account|login)\b.{0,40}?\b(?:otp|password|pin|login)`, negatable: true },
  ],

  // R07
  institutional_offer: [
    { re: r`institutional\s+(?:account|trading|client|investor|group|membership|access|plan)` },
    { re: r`\bfpi\b|\bfii\b` },
    { re: r`\bpre[\s-]?ipo\b` },
    { re: r`(?:ipo\s+)?(?:preferential|guaranteed|confirmed|sure|backdoor|special)\s+(?:ipo\s+)?(?:allot(?:ment)?|allocation|quota)` },
    { re: r`\bblock\s+deals?\b` },
    { re: r`\bupper\s+circuit\b` },
    { re: r`\bdabba\b` },
    { re: r`\bsub[\s-]?accounts?\b` },
    { re: r`\bbackdoor\s+(?:ipo|entry|allot)` },
  ],

  // R08
  withdraw_fee: [
    {
      re: r`\b(?:tax|taxes|fees?|charges?|gst|tds|deposit|penalty|commission|margin|security)\b.{0,75}?\b(?:withdraw(?:al)?|withdrawing|release|unlock|unfreeze|credited\s+to\s+your\s+bank)\b`,
      also: r`\b(?:pay|paid|deposit|send|transfer|clear|submit|required|needed|must|mandatory|compulsory|demand|asking|asked|ask|first|before)\b`,
      negatable: true,
    },
    {
      re: r`\b(?:withdraw(?:al)?|withdrawing|release|unlock|unfreeze)\b.{0,75}?\b(?:tax|taxes|fees?|charges?|gst|tds|penalty|security\s+deposit)\b`,
      also: r`\b(?:pay|paid|deposit|send|transfer|clear|submit|required|needed|must|mandatory|compulsory|demand|asking|asked|ask|first|before)\b`,
      negatable: true,
    },
    { re: r`\bunlock\s+(?:fee|charges?|amount)\b`, negatable: true },
    // "before we transfer it you have to deposit 20% service tax"
    {
      re: r`\b(?:before|until|unless)\s+(?:we|i|they)\s+(?:transfer|release|send|credit)\b.{0,60}?\b(?:tax|fees?|charges?|deposit)\b`,
      negatable: true,
    },
  ],

  // R09
  off_store_app: [
    { re: r`\.apk\b` },
    { re: r`\bapk\b` },
    { re: r`(?:download|install)\s+(?:the\s+|our\s+|this\s+|my\s+)?(?:trading\s+)?(?:app|application)\s+(?:from|using|via|through|with)\s+(?:the\s+|this\s+)?(?:link|url|below)` },
    { re: r`(?:app|application)\s+(?:download\s+)?link` },
  ],

  // R10
  vip_group: [
    { re: r`\b(?:vip|premium|institutional|elite|official|exclusive|prime|gold|platinum|diamond|pro)\s+(?:[\w'\"]+\s+){0,2}?(?:group|channel|community|club|room|circle)\b` },
    { re: r`(?:you\s+(?:have\s+been|are|were)\s+added|added\s+you|we\s+added\s+you)\s+(?:to|in|into)\s+(?:a\s+|the\s+|our\s+)?(?:[\w'\"]+\s+){0,3}?(?:group|channel)` },
    { re: r`\bjoin\s+(?:our|my|the|this|us\s+in\s+our)\s+(?:\w+\s+){0,2}?(?:group|channel|community)\b` },
  ],

  // R11
  urgency_secrecy: [
    { re: r`\b(?:act|invest|pay|join|register|book|decide|deposit|hurry)\s+(?:up\s+)?(?:now|today|immediately|fast|quickly|asap)\b` },
    { re: r`\blimited\s+(?:slots?|seats?|time|period|offer|spots?|vacancies)\b` },
    { re: r`\blast\s+(?:chance|day|few\s+(?:slots|seats|spots))\b` },
    { re: r`\b(?:only|just)\s+\d+\s+(?:slots?|seats?|spots?)\s+(?:left|remaining|available)\b` },
    { re: r`\btoday\s+only\b|\bhurry\b` },
    { re: r`\b(?:don'?t|do\s+not|never)\s+(?:tell|share\s+this\s+with|inform|discuss(?:\s+this)?\s+with)\s+(?:this\s+to\s+)?(?:anyone|anybody|your\s+(?:family|wife|husband|son|daughter|friends?|bank|parents?))`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`\bkeep\s+(?:this|it)\s+(?:a\s+)?(?:secret|confidential|private|between\s+us)\b`, except: r`otp|password|passcode|pin\b|cvv|login|ओटीपी|पासवर्ड|पिन|लॉगिन|लॉग\s*इन|सीवीवी` },
    { re: r`\b(?:offer|slots?|registration)\s+(?:ends|expires|closing|closes|is\s+closing)\b` },
    { re: r`\bbefore\s+(?:midnight|tonight|market\s+opens|it'?s\s+too\s+late)\b` },
  ],

  // R12
  profit_proof: [
    { re: r`\b(?:profit|proof|results?|trades?|success|earning)s?\s+(?:screenshots?|track\s*record|records?|history|proofs?)\b` },
    { re: r`\bscreenshots?\s+of\s+(?:my\s+|our\s+|members?'?s?\s+|clients?'?s?\s+)?(?:profits?|gains?|earnings?|withdrawals?|returns?)\b` },
    { re: r`\b(?:see|check|look\s+at|watch)\s+(?:our\s+|my\s+|the\s+)?(?:profit|payment|withdrawal)\s+(?:screenshots?|proofs?)\b` },
    { re: r`\b(?:our\s+)?members?\s+(?:have\s+)?(?:earned|made|profited)\b` },
    { re: r`\bsuccess\s+stor(?:y|ies)\b` },
    { re: r`\b(?:earned|made|profit(?:ed)?)\s+(?:rs\.?\s*|₹\s*)?\d[\d,]*\s*(?:lakhs?|k|crores?)?\s+(?:in|within|just\s+in)\s+(?:\d+|one|a)\s+(?:days?|weeks?|months?|hours?)\b` },
  ],

  // R13
  refund_fee: [
    {
      re: r`\b(?:recover|get\s+back|retrieve|refund|return|release)\s+(?:your\s+|the\s+|all\s+your\s+)?(?:lost\s+|stuck\s+|blocked\s+|stolen\s+)?(?:money|funds?|amount|investment|loss(?:es)?)\b`,
      also: r`\b(?:fees?|charges?|commission|deposit|pay|payment|advance|processing|tax|gst)\b`,
      negatable: true,
    },
    {
      re: r`\bget\s+(?:your|the)\s+(?:lost\s+|stuck\s+)?(?:money|funds?|amount|investment)\s+back\b`,
      also: r`\b(?:fees?|charges?|commission|deposit|pay|payment|advance|processing|tax|gst)\b`,
      negatable: true,
    },
    { re: r`\b(?:fund|money)\s+recovery\s+(?:service|team|agent|lawyer|agency|expert|company)\b`, negatable: true },
    { re: r`\brecovery\s+(?:agent|agency|lawyer|team|expert|service|company)\b`, negatable: true },
    { re: r`\b(?:lawyer|advocate)\b.{0,50}?\b(?:recover|get\s+back|return)\b.{0,30}?\b(?:money|funds?|amount)\b`, negatable: true },
  ],

  // R14
  official_impersonation: [
    {
      re: r`\b(?:sebi|nsdl|cdsl|nse|bse|rbi|depository|stock\s+exchange)\s+(?:officer|official|executive|manager|inspector|agent|representative|department|enforcement)\b`,
      also: r`\b(?:pay|fee|money|details?|login|password|otp|verify|kyc|close[ds]?|block(?:ed)?|suspend(?:ed)?|freez(?:e|ing)|share|send|penalty|fine|action)\b`,
    },
    {
      re: r`\b(?:officer|official|executive|manager|representative)\s+(?:of|from|at|with)\s+(?:the\s+)?(?:sebi|nsdl|cdsl|nse|bse|rbi|your\s+(?:broker|depository|dp)|depository)\b`,
      also: r`\b(?:pay|fee|money|details?|login|password|otp|verify|kyc|close[ds]?|block(?:ed)?|suspend(?:ed)?|freez(?:e|ing)|share|send|penalty|fine|action|deposit|charges?|case)\b`,
    },
    {
      re: r`\b(?:calling|speaking|messaging|writing)\s+from\s+(?:sebi|nsdl|cdsl|nse|bse|rbi|your\s+(?:broker|depository|dp)|the\s+depository)\b`,
      also: r`\b(?:pay|fee|money|details?|login|password|otp|verify|kyc|close[ds]?|block(?:ed)?|suspend(?:ed)?|freez(?:e|ing)|share|send|penalty|fine|action)\b`,
    },
  ],

  // R15
  celebrity_endorsement: [
    { re: r`\b(?:ai|deep[\s-]?fake)[\s-]+(?:generated\s+)?video\b` },
    {
      re: r`\b(?:ratan\s+tata|mukesh\s+ambani|gautam\s+adani|elon\s+musk|nirmala\s+sitharaman|narayana\s+murthy|sudha\s+murty|anand\s+mahindra|sadhguru|amitabh\s+bachchan|virat\s+kohli|ms\s+dhoni|sachin\s+tendulkar|shah\s*rukh\s+khan|akshay\s+kumar|warren\s+buffett|narendra\s+modi|pm\s+modi)\b.{0,70}?\b(?:recommend|endorse|invest|platform|app|trading|scheme|plan|launch|reveals?|shares?|secret)\b`,
    },
  ],

  // R16
  invest_more: [
    { re: r`\b(?:invest|deposit|add|put|top[\s-]?up|recharge)\s+(?:rs\.?\s*|₹\s*)?\d[\d,]*\s+(?:more|extra|additional)\b` },
    { re: r`\b(?:invest|deposit|add|put|top[\s-]?up|recharge)\s+(?:some\s+|a\s+|an\s+)?(?:more|extra|additional|bigger|larger|higher)\b` },
    { re: r`\b(?:increase|raise|upgrade|boost)\s+(?:your\s+)?(?:investment|deposit|capital|amount|plan|level)\b` },
    { re: r`\bupgrade\s+(?:to\s+|your\s+(?:account\s+)?to\s+)?(?:vip|premium|gold|platinum|diamond)\b` },
    { re: r`\b(?:we|i|company)\s+(?:will|can)\s+(?:give|lend|loan|provide|arrange)\s+(?:you\s+)?(?:a\s+)?(?:loan|credit|funds?|money|margin)\b` },
    { re: r`\b(?:take|get)\s+(?:a\s+)?loan\s+(?:to|and|for)\s+(?:invest|deposit|trade)` },
    { re: r`\bborrow\s+(?:some\s+)?(?:money\s+)?(?:to|and|from)\s+.{0,20}?(?:invest|deposit)` },
    { re: r`\b(?:bigger|larger|higher)\s+(?:deposit|investment|capital)\b` },
  ],

  // R17
  hype_words: [
    { re: r`\bto\s+the\s+moon\b` },
    { re: r`\bbuy\s+(?:now|today|immediately|before)\b` },
    { re: r`\bthis\s+is\s+huge\b` },
    { re: r`\brocket(?:ing)?\b|\bmultibagger\b|\bjackpot\s+stock\b|\bpenny\s+stock\b` },
    { re: r`\b(?:next|upcoming)\s+(?:big|huge)\s+(?:stock|rocket|multibagger)\b` },
    { re: r`\b(?:10|20|50|100)x\b` },
    { re: r`\btarget\s+(?:of\s+)?(?:rs\.?\s*|₹\s*)?\d+` },
    { re: r`\b(?:insider|operator)\s+(?:tips?|info|news|calls?|backed)\b` },
    { re: r`\bhot\s+(?:tip|stock)\b` },
  ],

  // R18
  fake_cert_or_course: [
    { re: r`\b(?:trading|stock\s+market|share\s+market|options?|f&o|intraday|forex)\s+(?:course|classes?|mentorship|masterclass|coaching|training|academy|webinar|workshop)\b` },
    { re: r`\bfree\s+(?:trading\s+)?(?:course|webinar|masterclass|mentorship|classes)\b` },
    { re: r`\b(?:sebi|nse|bse)\s+(?:certificate|certified|licen[cs]e|approval)\s+(?:attached|copy|proof|number)\b` },
    { re: r`\b(?:certificate|licen[cs]e)\s+(?:of|from)\s+(?:sebi|nse|bse)\b` },
    { re: r`\b(?:sebi|nse|bse)\s+(?:registration\s+)?certificate\b` },
    { re: r`\bmentor(?:ship)?\s+(?:program|group)\b` },
  ],

  // clues, not rules on their own
  registered_claim: [
    { re: r`\b(?:sebi|nse|bse)[\s-]*(?:registered|approved|authori[sz]ed|certified|licen[cs]ed|regulated)\b` },
    { re: r`\bregistered\s+with\s+(?:sebi|nse|bse)\b` },
    { re: r`\b(?:registered|licen[cs]ed)\s+(?:investment\s+advis[eo]r|research\s+analyst|stock\s*broker|broker|advis[eo]r)\b` },
    { re: r`\bwe\s+are\s+(?:a\s+)?(?:registered|regulated|authori[sz]ed)\b` },
  ],

  payment_request: [
    { re: r`\b(?:pay|send|transfer|deposit|remit|put|invest|add|submit|give)\s+(?:rs\.?\s*|₹\s*|inr\s*)?\d[\d,]*`, negatable: true },
    { re: r`\b(?:pay|send|transfer|deposit|invest)\b.{0,40}?\b(?:upi|account|a/c|qr|wallet)\b`, negatable: true },
    { re: r`\b(?:registration|account\s+opening|joining|activation|membership|processing|kyc)\s+(?:fee|charges?|amount|deposit)\b`, negatable: true },
    { re: r`\bto\s+open\s+(?:your\s+|the\s+|an?\s+)?account\b` },
    { re: r`\bscan\s+(?:the\s+)?qr\b` },
    { re: r`\bminimum\s+(?:deposit|investment)\b` },
    { re: r`\b(?:pay|payment|deposit)\s+(?:now|today|first|immediately)\b`, negatable: true },
  ],

  bank_account: [
    { re: r`\bifsc\b|\b[a-z]{4}0[a-z0-9]{6}\b` },
    { re: r`\b(?:a/c|acc|account)\s*(?:no|number|num|#)\b` },
  ],

  // journey clues
  fake_profit_shown: [
    { re: r`\b(?:app|account|dashboard|wallet)\s+(?:is\s+)?show(?:s|ing)\s+(?:a\s+|my\s+)?(?:profits?|gains?|returns?|balance)\b` },
    { re: r`\bmy\s+(?:balance|profit|wallet|account)\s+(?:is|shows|has\s+become|became|reached)\b` },
    { re: r`\bshowing\s+(?:a\s+)?(?:profit|gain|returns?)\b` },
    { re: r`\b(?:i\s+)?(?:was\s+able\s+to\s+)?withdr(?:ew|awn)\s+(?:rs\.?\s*|₹\s*)?\d[\d,]*`, negatable: true },
    { re: r`\b(?:small|first|trial|test)\s+withdrawal\b` },
  ],

  app_blocked_or_gone: [
    { re: r`\b(?:app|website|site|platform|group|channel|account)\s+(?:is\s+|was\s+|has\s+|got\s+|stopped\s+|not\s+)?(?:closed|deleted|removed|disappeared|not\s+(?:opening|working|opens|responding)|stopped\s+working|crashed|shut\s+down|blocked|down)\b` },
    { re: r`\b(?:they|admin|he|she)\s+(?:have\s+)?(?:blocked|removed|deleted)\s+me\b` },
    { re: r`\b(?:cannot|can'?t|unable\s+to)\s+(?:open|login|log\s+in|access)\s+(?:the\s+|my\s+)?(?:app|account|website)\b` },
    { re: r`\bgroup\s+(?:deleted|closed|removed)\b` },
    { re: r`\bnumber\s+(?:is\s+)?(?:switched\s+off|not\s+reachable|blocked)\b` },
  ],

  money_sent: [
    { re: r`\bi\s+(?:have\s+|had\s+|already\s+|just\s+)?(?:paid|sent|transferred|deposited|invested|gave|lost)\s+(?:them\s+|him\s+|her\s+)?(?:rs\.?\s*|₹\s*|inr\s*)?\d[\d,]*` },
    { re: r`\b(?:already|just)\s+(?:paid|sent|transferred|deposited|invested)\b` },
    { re: r`\b(?:money|amount|payment)\s+(?:has\s+been\s+|was\s+|got\s+)?(?:debited|deducted|sent|transferred|paid)\b` },
    { re: r`\b(?:got\s+|been\s+|was\s+|am\s+)(?:scammed|cheated|duped|defrauded|fooled)\b` },
    { re: r`\bi\s+(?:have\s+)?lost\s+(?:rs\.?\s*|₹\s*|\d)` },
  ],

  registered_entity_grievance: [
    { re: r`\b(?:my\s+)?(?:broker|depository\s+participant|mutual\s+fund|amc|demat\s+provider|stock\s*broker)\s+(?:has\s+|is\s+|did\s+|not\s+|refus|ignor|delay|didn'?t|won'?t)` },
    { re: r`\bcomplain(?:t|ing)?\s+(?:against|about)\s+(?:my\s+|the\s+)?(?:broker|dp|mutual\s+fund)\b` },
    { re: r`\bgrievance\b|\bredressal\b` },
  ],

  warning_cue: [
    { re: r`\b(?:beware|be\s+careful|be\s+alert|stay\s+alert|stay\s+safe|watch\s+out|warning|caution)\b` },
    { re: r`\b(?:scam|fraud)\s+alert\b|\bdo\s+not\s+fall\s+for\b` },
    { re: r`\b(?:don'?t|never)\s+(?:fall|trust|believe|respond|click|pay|share|send)\b` },
    { re: r`\b(?:be\s+aware|awareness|investor\s+awareness)\b` },
    { re: r`\bhow\s+to\s+(?:spot|identify|avoid|recogni[sz]e|detect)\b` },
    { re: r`\bred\s+flags?\b` },
    { re: r`\b(?:sebi|nse|bse|nsdl|cdsl|rbi)\s+(?:has\s+)?(?:cautions?|warns?|cautioned|warned|advis(?:es|ed))\b` },
    { re: r`\b(?:fraudsters?|scammers?|cheaters?)\s+(?:are\s+|may\s+|can\s+|often\s+|usually\s+|typically\s+)?(?:claim|promise|pose|pretend|ask|offer|lure|trick|call|contact|say)` },
    { re: r`\bcommon\s+(?:scams?|frauds?|tricks?)\b` },
    // a news report about an arrest is not an offer either
    { re: r`\b(?:police|cops)\s+(?:have\s+)?(?:arrested|busted|caught|booked)\b|\b(?:arrested|busted)\s+(?:a\s+|the\s+)?(?:gang|accused|fraudsters?|racket)\b` },
    { re: r`\breport\s+(?:fraud|scam|suspicious)\b` },
  ],
};
