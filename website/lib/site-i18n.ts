export const LANGS = [
  { code: "en", label: "English" },
  { code: "hinglish", label: "Hinglish" },
  { code: "hi", label: "हिन्दी" },
] as const;

export type LangCode = "en" | "hinglish" | "hi";

const SITE_I18N: Record<LangCode, Record<string, string>> = {
  en: {
    // Navbar
    nav_home: "Home",
    nav_cards: "Find Cards",
    nav_pricing: "Pricing",
    nav_how: "How it works",
    nav_contact: "Contact",
    nav_add: "Add to Chrome",

    // Footer
    footer_tagline: "India-first, privacy-first",
    footer_no_cvv: "We never store your full card number / CVV.",

    // Home — hero
    home_badge: "🇮🇳 India-first · Free Chrome Extension",
    home_h1: "Find the card that saves you the most at checkout",
    home_h1_accent: "most",
    home_sub:
      "Amazon, Flipkart, Myntra — wherever you shop, CardWiz automatically shows which credit or debit card to use. Plus instant bank offers and bill reminders.",
    home_add: "⚡ Add to Chrome — Free",
    home_browse: "Browse {n} Cards →",
    home_demo_caption: "On this ₹5,999 Amazon purchase:",

    // Home — stats
    stat_cards: "Cards",
    stat_banks: "Banks",
    stat_sites: "Shopping Sites",

    // Home — features
    home_feat_h: "What do you get?",
    home_feat_sub: "One extension, many benefits",
    feat_0_title: "Auto Checkout Detection",
    feat_0_desc:
      "Amazon, Flipkart, Myntra + 13 more sites — best card suggested when cart opens, automatically.",
    feat_1_title: "195+ Indian Cards",
    feat_1_desc:
      "From HDFC, SBI, ICICI, Axis to neobanks (OneCard, Slice, Scapia) — credit and debit both.",
    feat_2_title: "Instant Bank Offers",
    feat_2_desc:
      "Reads checkout instant discounts and combines them with rewards to pick the best card.",
    feat_3_title: "Bill Reminders",
    feat_3_desc:
      "Add bill due date — CardWiz reminds 3 days early. Never a late payment again.",
    feat_4_title: "100% Privacy",
    feat_4_desc:
      "Data only on your device. Card number or CVV never asked. No bank login.",
    feat_5_title: "Free + Premium",
    feat_5_desc:
      "Core features completely free. Premium: unlimited cards, cloud sync, analytics.",

    // Home — how
    home_how_h: "How does it work?",
    home_how_sub: "3 simple steps",
    step_1_title: "Install the extension",
    step_1_desc: "Free from Chrome Web Store. 30 seconds.",
    step_2_title: "Add your cards",
    step_2_desc: "Just last 4 digits — full number never needed.",
    step_3_title: "Shop and save",
    step_3_desc: "Best card + savings shown automatically at checkout.",

    // Home — privacy
    home_priv_h: "🔒 Privacy-first, always",
    home_priv_p:
      "Your complete data stays only on your device. We never ask for or store your full card number, CVV, or bank login. This is our core principle.",
    priv_0: "❌ No card number",
    priv_1: "❌ No CVV ever",
    priv_2: "❌ No bank login",
    priv_3: "✅ Local device only",
    priv_4: "✅ Read-only",

    // Home — final CTA
    home_cta_h: "Save on every purchase.",
    home_cta_accent: "Save",
    home_cta_sub:
      "Free Chrome extension. {credit}+ credit cards, {total} total. 30 second setup.",
    home_cta_btn: "⚡ Add CardWiz to Chrome",

    // Pricing — header
    pricing_badge: "💎 Simple, India-first pricing",
    pricing_h1_a: "Choose the right",
    pricing_h1_b: "plan for you",
    pricing_h1_accent: "plan",
    pricing_sub:
      "Core features always free. For more cards, analytics and advanced tools, Premium or Pro.",

    // Pricing — toggle
    toggle_monthly: "Monthly",
    toggle_yearly: "Yearly",
    toggle_save: "save up to ₹{n}",

    // Pricing — plan card
    plan_save_yr: "Save ₹{n} a year",
    plan_trial: "1st month free · cancel anytime",
    cta_install: "⚡ Add to Chrome — Free",
    cta_notify: "🔔 Coming soon — notify me",
    plan_note:
      "Premium & Pro plans launching soon. All core features completely free for now — install the extension and start today. Prices in INR.",

    // Pricing — FAQ
    faq_h: "FAQ",
    faq_0_q: "Will the free version always be free?",
    faq_0_a:
      "Yes. Core features like best-card suggestions, bill reminders and bank-offer detection are always free.",
    faq_1_q: "What's the difference between Premium and Pro?",
    faq_1_a:
      "Premium for regular shoppers (unlimited cards, analytics, cloud sync). Pro will have extra advanced features — details coming soon.",
    faq_2_q: "How will payment work?",
    faq_2_a:
      "Premium & Pro are launching soon. Tap 'Notify me' — we'll email you when live. We never ask for card number/CVV.",
    faq_3_q: "Can I cancel?",
    faq_3_a:
      "Yes, anytime. On cancellation, benefits continue until end of current period, then back to free.",
  },

  hinglish: {
    // Navbar
    nav_home: "Home",
    nav_cards: "Cards Dhundho",
    nav_pricing: "Pricing",
    nav_how: "Kaise kaam karta hai",
    nav_contact: "Contact",
    nav_add: "Chrome mein add karo",

    // Footer
    footer_tagline: "India-first, privacy-first",
    footer_no_cvv: "Hum kabhi aapka full card number / CVV store nahi karte.",

    // Home — hero
    home_badge: "🇮🇳 India-first · Free Chrome Extension",
    home_h1: "Checkout pe sabse zyada bachat wala card batao",
    home_h1_accent: "sabse zyada",
    home_sub:
      "Amazon, Flipkart, Myntra — jahan bhi kharido, CardWiz automatically batata hai kaun sa credit ya debit card use karein. Plus instant bank offers aur bill reminders.",
    home_add: "⚡ Chrome mein add karo — Free",
    home_browse: "{n} Cards dekho →",
    home_demo_caption: "Is ₹5,999 Amazon purchase pe:",

    // Home — stats
    stat_cards: "Cards",
    stat_banks: "Banks",
    stat_sites: "Shopping Sites",

    // Home — features
    home_feat_h: "Kya kya milta hai?",
    home_feat_sub: "Ek extension, bahut fayde",
    feat_0_title: "Auto Checkout Detection",
    feat_0_desc:
      "Amazon, Flipkart, Myntra + 13 aur sites pe cart khulte hi best card suggest — bina kuch kiye.",
    feat_1_title: "195+ Indian Cards",
    feat_1_desc:
      "HDFC, SBI, ICICI, Axis se lekar neobanks (OneCard, Slice, Scapia) tak — credit aur debit dono.",
    feat_2_title: "Instant Bank Offers",
    feat_2_desc:
      "Checkout pe dikhne wale instant discounts padhta hai aur reward ke saath jodke best card chunta hai.",
    feat_3_title: "Bill Reminders",
    feat_3_desc:
      "Bill due date daalo — CardWiz 3 din pehle remind karega. Kabhi late payment nahi.",
    feat_4_title: "100% Privacy",
    feat_4_desc:
      "Data sirf aapke device pe. Card number ya CVV kabhi nahi maangte. Koi bank login nahi.",
    feat_5_title: "Free + Premium",
    feat_5_desc:
      "Core features bilkul free. Premium mein unlimited cards, cloud sync, analytics.",

    // Home — how
    home_how_h: "Kaise kaam karta hai?",
    home_how_sub: "3 simple steps",
    step_1_title: "Extension install karo",
    step_1_desc: "Chrome Web Store se free. 30 seconds.",
    step_2_title: "Apne cards add karo",
    step_2_desc: "Sirf last 4 digits se — poora number kabhi nahi.",
    step_3_title: "Shopping karo, bachao",
    step_3_desc: "Checkout pe automatically best card + savings dikhega.",

    // Home — privacy
    home_priv_h: "🔒 Privacy-first, hamesha",
    home_priv_p:
      "Aapka poora data sirf aapke device pe rehta hai. Hum kabhi bhi aapka full card number, CVV, ya bank login nahi maangte aur nahi store karte. Ye humara core principle hai.",
    priv_0: "❌ No card number",
    priv_1: "❌ No CVV ever",
    priv_2: "❌ No bank login",
    priv_3: "✅ Local device only",
    priv_4: "✅ Read-only",

    // Home — final CTA
    home_cta_h: "Har purchase pe bachao.",
    home_cta_accent: "bachao",
    home_cta_sub:
      "Free Chrome extension. {credit}+ credit cards, {total} total. 30 second setup.",
    home_cta_btn: "⚡ CardWiz Chrome mein add karo",

    // Pricing — header
    pricing_badge: "💎 Simple, India-first pricing",
    pricing_h1_a: "Apne liye sahi",
    pricing_h1_b: "plan chuno",
    pricing_h1_accent: "plan",
    pricing_sub:
      "Core features hamesha free. Zyada cards, analytics aur advanced tools ke liye Premium ya Pro.",

    // Pricing — toggle
    toggle_monthly: "Monthly",
    toggle_yearly: "Yearly",
    toggle_save: "save up to ₹{n}",

    // Pricing — plan card
    plan_save_yr: "Save ₹{n} a year",
    plan_trial: "1st month free · cancel anytime",
    cta_install: "⚡ Chrome mein add karo — Free",
    cta_notify: "🔔 Jald aata hai — notify karo",
    plan_note:
      "Premium & Pro plans jald hi live ho rahe hain. Abhi saare core features bilkul free hain — extension install karke aaj hi shuru karo. Prices in INR.",

    // Pricing — FAQ
    faq_h: "Sawaal-jawaab",
    faq_0_q: "Kya free version hamesha free rahega?",
    faq_0_a:
      "Haan. Best-card suggestions, bill reminders aur bank-offer detection jaise core features hamesha free hain.",
    faq_1_q: "Premium aur Pro mein kya farak hai?",
    faq_1_a:
      "Premium regular shoppers ke liye (unlimited cards, analytics, cloud sync). Pro mein extra advanced features honge — detail jald hi.",
    faq_2_q: "Payment kaise hoga?",
    faq_2_a:
      "Premium & Pro abhi launch ho rahe hain. 'Notify me' dabao — live hote hi aapko email karenge. Hum kabhi card number/CVV nahi maangte.",
    faq_3_q: "Cancel kar sakta hoon?",
    faq_3_a:
      "Haan, kabhi bhi. Cancel karne par current period ke end tak benefits chalte hain, phir free pe wapas.",
  },

  hi: {
    // Navbar
    nav_home: "होम",
    nav_cards: "कार्ड खोजें",
    nav_pricing: "मूल्य",
    nav_how: "कैसे काम करता है",
    nav_contact: "संपर्क",
    nav_add: "Chrome में जोड़ें",

    // Footer
    footer_tagline: "भारत-पहले, प्राइवेसी-पहले",
    footer_no_cvv: "हम कभी आपका पूरा कार्ड नंबर / CVV स्टोर नहीं करते।",

    // Home — hero
    home_badge: "🇮🇳 India-first · मुफ़्त Chrome Extension",
    home_h1: "Checkout पर सबसे ज़्यादा बचत वाला कार्ड बताएँ",
    home_h1_accent: "सबसे ज़्यादा",
    home_sub:
      "Amazon, Flipkart, Myntra — जहाँ भी खरीदें, CardWiz automatically बताता है कौन सा credit या debit card यूज़ करें। Plus instant bank offers और bill reminders।",
    home_add: "⚡ Chrome में जोड़ें — मुफ़्त",
    home_browse: "{n} कार्ड देखें →",
    home_demo_caption: "इस ₹5,999 Amazon purchase पर:",

    // Home — stats
    stat_cards: "Cards",
    stat_banks: "Banks",
    stat_sites: "Shopping Sites",

    // Home — features
    home_feat_h: "क्या-क्या मिलता है?",
    home_feat_sub: "एक extension, बहुत फ़ायदे",
    feat_0_title: "Auto Checkout Detection",
    feat_0_desc:
      "Amazon, Flipkart, Myntra + 13 और sites पर cart खुलते ही best card suggest — बिना कुछ किए।",
    feat_1_title: "195+ Indian Cards",
    feat_1_desc:
      "HDFC, SBI, ICICI, Axis से लेकर neobanks (OneCard, Slice, Scapia) तक — credit और debit दोनों।",
    feat_2_title: "Instant Bank Offers",
    feat_2_desc:
      "Checkout पर दिखने वाले instant discounts पढ़ता है और reward के साथ जोड़कर best card चुनता है।",
    feat_3_title: "Bill Reminders",
    feat_3_desc:
      "Bill due date डालें — CardWiz 3 दिन पहले remind करेगा। कभी late payment नहीं।",
    feat_4_title: "100% प्राइवेसी",
    feat_4_desc:
      "डेटा सिर्फ़ आपके device पर। Card number या CVV कभी नहीं माँगते। कोई bank login नहीं।",
    feat_5_title: "Free + Premium",
    feat_5_desc:
      "Core features बिल्कुल free। Premium में unlimited cards, cloud sync, analytics।",

    // Home — how
    home_how_h: "कैसे काम करता है?",
    home_how_sub: "3 आसान steps",
    step_1_title: "Extension install करें",
    step_1_desc: "Chrome Web Store से free। 30 seconds।",
    step_2_title: "अपने cards जोड़ें",
    step_2_desc: "सिर्फ़ last 4 digits से — पूरा नंबर कभी नहीं।",
    step_3_title: "Shopping करें, बचाएँ",
    step_3_desc: "Checkout पर automatically best card + savings दिखेगा।",

    // Home — privacy
    home_priv_h: "🔒 Privacy-first, हमेशा",
    home_priv_p:
      "आपका पूरा डेटा सिर्फ़ आपके device पर रहता है। हम कभी भी आपका full card number, CVV, या bank login नहीं माँगते और नहीं store करते। यह हमारा core principle है।",
    priv_0: "❌ कार्ड नंबर नहीं",
    priv_1: "❌ CVV कभी नहीं",
    priv_2: "❌ Bank login नहीं",
    priv_3: "✅ सिर्फ़ device पर",
    priv_4: "✅ Read-only",

    // Home — final CTA
    home_cta_h: "हर purchase पर बचाएँ।",
    home_cta_accent: "बचाएँ",
    home_cta_sub:
      "मुफ़्त Chrome extension। {credit}+ credit cards, {total} total। 30 second setup।",
    home_cta_btn: "⚡ CardWiz Chrome में जोड़ें",

    // Pricing — header
    pricing_badge: "💎 सरल, India-first pricing",
    pricing_h1_a: "अपने लिए सही",
    pricing_h1_b: "plan चुनें",
    pricing_h1_accent: "plan",
    pricing_sub:
      "Core features हमेशा free। ज़्यादा cards, analytics और advanced tools के लिए Premium या Pro।",

    // Pricing — toggle
    toggle_monthly: "Monthly",
    toggle_yearly: "Yearly",
    toggle_save: "बचाएँ ₹{n} तक",

    // Pricing — plan card
    plan_save_yr: "₹{n} प्रति वर्ष बचत",
    plan_trial: "पहला महीना free · कभी भी cancel करें",
    cta_install: "⚡ Chrome में जोड़ें — Free",
    cta_notify: "🔔 जल्द आ रहा है — notify करें",
    plan_note:
      "Premium & Pro plans जल्द ही live हो रहे हैं। अभी सारे core features बिल्कुल free हैं — extension install करके आज ही शुरू करें। कीमतें INR में।",

    // Pricing — FAQ
    faq_h: "सवाल-जवाब",
    faq_0_q: "क्या free version हमेशा free रहेगा?",
    faq_0_a:
      "हाँ। Best-card suggestions, bill reminders और bank-offer detection जैसे core features हमेशा free हैं।",
    faq_1_q: "Premium और Pro में क्या फ़र्क है?",
    faq_1_a:
      "Premium regular shoppers के लिए (unlimited cards, analytics, cloud sync)। Pro में extra advanced features होंगे — विवरण जल्द ही।",
    faq_2_q: "Payment कैसे होगा?",
    faq_2_a:
      "Premium & Pro अभी launch हो रहे हैं। 'Notify me' दबाएँ — live होते ही email करेंगे। हम कभी card number/CVV नहीं माँगते।",
    faq_3_q: "Cancel कर सकता हूँ?",
    faq_3_a:
      "हाँ, कभी भी। Cancel करने पर current period के end तक benefits चलते हैं, फिर free पर वापस।",
  },
};

export function t(
  lang: LangCode,
  key: string,
  vars?: Record<string, string | number>
): string {
  const val =
    SITE_I18N[lang]?.[key] ?? SITE_I18N["en"][key] ?? key;
  if (!vars) return val;
  return val.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
