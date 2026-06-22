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
    nav_cards: "Cards",
    nav_pricing: "Pricing",
    nav_how: "How it works",
    nav_contact: "Contact",
    nav_findcard: "Best Card Finder",
    nav_ai: "AI",
    nav_add: "Add to Chrome",
    // Cards page / CardFinder
    cf_search_ph: "Search a card or bank — like 'HDFC', 'cashback', 'Amazon'…",
    cf_all_cards: "All cards",
    cf_credit: "Credit",
    cf_debit: "Debit",
    cf_all_types: "All reward types",
    cf_type_cashback: "Cashback",
    cf_type_points: "Reward Points",
    cf_type_miles: "Travel Miles",
    cf_all_banks: "All banks",
    cf_all_categories: "All categories",
    cf_sort_reward: "Sort: Highest reward",
    cf_sort_fee: "Sort: Lowest fee",
    cf_sort_name: "Sort: Name (A–Z)",
    cf_count: "{n} cards",
    cf_empty_filtered: "No cards match these filters.",
    cf_empty_none: "No cards found.",
    cf_clear_filters: "Clear filters",
    ci_top_reward: "top reward",
    ci_annual_fee: "annual fee",
    ci_best_for: "Best for {cat}",
    plan_tag_free: "To get started — always free.",
    plan_tag_premium: "For regular shoppers.",
    plan_tag_pro: "Maximum savings, for power users.",

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

    // Home — explore (live entry points)
    explore_h: "Explore CardWiz",
    explore_sub: "Every tool, one click away.",
    xp_open: "Open →",
    xp_ai_t: "🤖 AI Card Assistant",
    xp_ai_d: "Kya kharidna hai? AI batayega kaunsa card best hai.",
    xp_offers_t: "Bank Offers",
    xp_offers_d: "Live, community-verified credit card offers.",
    xp_find_t: "Best Card Finder",
    xp_find_d: "8 quick questions → your perfect card.",
    xp_cards_t: "Browse Cards",
    xp_cards_d: "Compare 195+ Indian cards by reward rate.",
    xp_acct_t: "My Account",
    xp_acct_d: "Savings report, transactions & cloud sync.",
    xp_news_t: "News & Guides",
    xp_news_d: "Latest card news, tips and best-card guides.",

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
      "By default your data stays only on your device. Cloud Sync (optional, only if you sign in) syncs limited card details — type, nickname, last-4, due date. We never ask for or store your full card number, CVV, or bank login. This is our core principle.",
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
    pricing_h1_b: "for you",
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

    // Quiz — Find My Card
    quiz_teaser_title: "Know your best credit card in 2 minutes",
    quiz_teaser_sub:
      "8 quick questions → a personalised ₹-value recommendation. 🔒 Your answers never leave your browser.",
    quiz_teaser_cta: "Start the quiz →",
    quiz_back: "Back",
    quiz_progress: "Question {n} / {total}",
    quiz_privacy: "Your answers never leave this browser.",
    quiz_calc: "Crunching the best cards for your spending…",
    quiz_q1_title: "Your #1 spending category?",
    quiz_q2_title: "And your #2 category?",
    quiz_cat_online: "Amazon / Flipkart / online shopping",
    quiz_cat_travel: "Flights, hotels & travel",
    quiz_cat_food: "Restaurants, Zomato, Swiggy",
    quiz_cat_daily: "Fuel + grocery + offline",
    quiz_cat_utility: "Electricity / recharge / insurance",
    quiz_cat_entertainment: "OTT & entertainment",
    quiz_q3_title: "How much do you spend on the card monthly?",
    quiz_q3_8000: "Under ₹10,000",
    quiz_q3_20000: "₹10,000 – ₹30,000",
    quiz_q3_50000: "₹30,000 – ₹75,000",
    quiz_q3_120000: "₹75,000+",
    quiz_q4_title: "Where will the card mostly be used?",
    quiz_q4_domestic: "Only in India",
    quiz_q4_mixed: "India + occasional foreign",
    quiz_q4_international: "Frequent international travel",
    quiz_q4_business: "Business + travel",
    quiz_q5_title: "Which reward feels best to you?",
    quiz_q5_cashback: "Direct cashback to account",
    quiz_q5_points: "Points (redeem on Amazon/Flipkart)",
    quiz_q5_miles: "Air miles + airport lounge",
    quiz_q5_premium: "Premium perks (dining, golf, concierge)",
    quiz_q6_title: "How much annual fee is acceptable?",
    quiz_q6_0: "₹0 — Lifetime Free only",
    quiz_q6_1000: "Up to ₹1,000",
    quiz_q6_3000: "Up to ₹3,000",
    quiz_q6_999999: "No bar — best card please",
    quiz_q7_title: "Your credit card experience?",
    quiz_q7_beginner: "This will be my first card",
    quiz_q7_1card: "I have 1 card",
    quiz_q7_experienced: "I have 2–3 cards",
    quiz_q7_expert: "I have 4+ cards",
    quiz_q8_title: "Approximate CIBIL score?",
    quiz_q8_unknown: "Don't know / first card",
    quiz_q8_low: "Below 700",
    quiz_q8_good: "700 – 750",
    quiz_q8_excellent: "750+",
    quiz_results_title: "Your top picks",
    quiz_hero_badge: "Best match",
    quiz_ongoing_label: "Estimated ongoing value / year",
    quiz_first_year: "First-year bonus ~₹{v}",
    quiz_fee_ltf: "Lifetime Free",
    quiz_fee_yr: "₹{v}/yr fee",
    quiz_fee_waived: "Fee waived at ₹{v} spend",
    quiz_reason_reward: "{rate}% on {cat}",
    quiz_reason_ltf: "Lifetime Free",
    quiz_reason_waived: "Fee waivable on spend",
    quiz_elig_flag: "Better approval odds with a 750+ score",
    quiz_apply: "Apply ↗",
    quiz_apply_note: "*may be a commission link",
    quiz_details: "Details →",
    quiz_retake: "Retake quiz",
    quiz_empty: "No matching card found",
    quiz_fallback: "No exact match for your filters — here are the closest.",
    quiz_disc_affiliate:
      "Apply links may earn us a commission — ranking is by your benefit, never payout.",
    quiz_disc_advice:
      "For information only, not financial advice. Approval depends on the issuer's eligibility.",
    quiz_disc_redemption:
      "₹ value assumes best-case redemption (points/miles redeemed optimally).",
    quiz_freshness: "Card data last updated: {date}",

    // Auth
    auth_signin: "Sign in",
    auth_signout: "Sign out",
    auth_plan_free: "Free",
    auth_plan_premium: "Premium",
    auth_blurb:
      "Sign in to sync your plan across devices. We only take your name & email — never card number or CVV.",

    // News + Account
    nav_news: "News",
    nav_offers: "Offers",
    nav_admin: "Admin",
    nav_account: "My Account",
    news_title: "News & Updates",
    news_sub: "Credit card and personal finance news, tips and updates.",
    news_empty: "No articles yet — check back soon.",
    home_news_h: "Latest news",
    home_news_sub: "Credit card & finance updates",
    home_news_all: "All news",
  },

  hinglish: {
    // Navbar
    nav_home: "Home",
    nav_cards: "Cards",
    nav_pricing: "Pricing",
    nav_how: "Kaise kaam karta hai",
    nav_contact: "Contact",
    nav_findcard: "Best Card Khojo",
    nav_ai: "AI",
    nav_add: "Chrome mein add karo",
    // Cards page / CardFinder
    cf_search_ph: "Card ya bank search karo — jaise 'HDFC', 'cashback', 'Amazon'…",
    cf_all_cards: "Saare cards",
    cf_credit: "Credit",
    cf_debit: "Debit",
    cf_all_types: "Saare reward types",
    cf_type_cashback: "Cashback",
    cf_type_points: "Reward Points",
    cf_type_miles: "Travel Miles",
    cf_all_banks: "Saare banks",
    cf_all_categories: "Saari categories",
    cf_sort_reward: "Sort: Sabse zyada reward",
    cf_sort_fee: "Sort: Sabse kam fee",
    cf_sort_name: "Sort: Naam (A–Z)",
    cf_count: "{n} cards mile",
    cf_empty_filtered: "In filters se koi card nahi mila.",
    cf_empty_none: "Koi card nahi mila.",
    cf_clear_filters: "Filters clear karo",
    ci_top_reward: "top reward",
    ci_annual_fee: "annual fee",
    ci_best_for: "{cat} ke liye best",
    plan_tag_free: "Shuru karne ke liye — hamesha free.",
    plan_tag_premium: "Regular shoppers ke liye.",
    plan_tag_pro: "Maximum bachat, power users ke liye.",

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

    // Home — explore (live entry points)
    explore_h: "CardWiz Explore karo",
    explore_sub: "Har tool ek click door.",
    xp_open: "Kholo →",
    xp_ai_t: "🤖 AI Card Assistant",
    xp_ai_d: "Kya kharidna hai? AI batayega kaunsa card best hai.",
    xp_offers_t: "Bank Offers",
    xp_offers_d: "Live, community-verified credit card offers.",
    xp_find_t: "Best Card Finder",
    xp_find_d: "8 sawaal → aapka perfect card.",
    xp_cards_t: "Cards Dekho",
    xp_cards_d: "195+ Indian cards reward-rate se compare karo.",
    xp_acct_t: "Mera Account",
    xp_acct_d: "Savings report, transactions & cloud sync.",
    xp_news_t: "News & Guides",
    xp_news_d: "Latest card news, tips aur best-card guides.",

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
      "By default aapka data sirf aapke device pe rehta hai. Cloud Sync (optional, sirf sign-in karne par) limited card details sync karta hai — type, nickname, last-4, due date. Hum kabhi bhi aapka full card number, CVV, ya bank login nahi maangte aur nahi store karte. Ye humara core principle hai.",
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
    pricing_h1_b: "chuno",
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

    // Quiz — Find My Card
    quiz_teaser_title: "2 minute mein apna best credit card jaano",
    quiz_teaser_sub:
      "8 sawaal → personalised ₹-value recommendation. 🔒 Aapke jawaab browser se bahar nahi jaate.",
    quiz_teaser_cta: "Quiz shuru karein →",
    quiz_back: "Peeche",
    quiz_progress: "Sawaal {n} / {total}",
    quiz_privacy: "Aapke jawaab kabhi is browser se bahar nahi jaate.",
    quiz_calc: "Aapke kharch pe best cards nikaal rahe hain…",
    quiz_q1_title: "Sabse bada kharch kahan? (#1)",
    quiz_q2_title: "Uske baad dusra sabse bada? (#2)",
    quiz_cat_online: "Amazon / Flipkart / online shopping",
    quiz_cat_travel: "Flights, hotels & travel",
    quiz_cat_food: "Restaurants, Zomato, Swiggy",
    quiz_cat_daily: "Fuel + grocery + offline",
    quiz_cat_utility: "Bijli / recharge / insurance",
    quiz_cat_entertainment: "OTT & entertainment",
    quiz_q3_title: "Card se mahine ka total kharch?",
    quiz_q3_8000: "₹10,000 se kam",
    quiz_q3_20000: "₹10,000 – ₹30,000",
    quiz_q3_50000: "₹30,000 – ₹75,000",
    quiz_q3_120000: "₹75,000+",
    quiz_q4_title: "Card kahan zyada use hoga?",
    quiz_q4_domestic: "Sirf India mein",
    quiz_q4_mixed: "India + kabhi-kabhi foreign",
    quiz_q4_international: "International travel frequent hai",
    quiz_q4_business: "Business + travel",
    quiz_q5_title: "Kaunsa reward best lagta hai?",
    quiz_q5_cashback: "Seedha cashback account mein",
    quiz_q5_points: "Points (Amazon/Flipkart pe redeem)",
    quiz_q5_miles: "Air miles + airport lounge",
    quiz_q5_premium: "Premium perks (dining, golf, concierge)",
    quiz_q6_title: "Annual fee kitni acceptable hai?",
    quiz_q6_0: "₹0 — Lifetime Free only",
    quiz_q6_1000: "₹1,000 tak theek hai",
    quiz_q6_3000: "₹3,000 tak theek hai",
    quiz_q6_999999: "Fee no bar — best card chahiye",
    quiz_q7_title: "Credit card experience?",
    quiz_q7_beginner: "Yeh mera pehla card hoga",
    quiz_q7_1card: "1 card hai",
    quiz_q7_experienced: "2–3 cards hain",
    quiz_q7_expert: "4+ cards hain",
    quiz_q8_title: "Approximate CIBIL score?",
    quiz_q8_unknown: "Pata nahi / pehla card",
    quiz_q8_low: "700 se kam",
    quiz_q8_good: "700 – 750",
    quiz_q8_excellent: "750+",
    quiz_results_title: "Aapke liye top picks",
    quiz_hero_badge: "Best match",
    quiz_ongoing_label: "Anumaanit saalana value (aapke kharch pe)",
    quiz_first_year: "First-year bonus ~₹{v}",
    quiz_fee_ltf: "Lifetime Free",
    quiz_fee_yr: "₹{v}/saal fee",
    quiz_fee_waived: "₹{v} spend pe fee waive",
    quiz_reason_reward: "{cat} pe {rate}% reward",
    quiz_reason_ltf: "Lifetime Free",
    quiz_reason_waived: "Spend pe fee waive ho sakti hai",
    quiz_elig_flag: "750+ score se approval odds better",
    quiz_apply: "Apply ↗",
    quiz_apply_note: "*commission link ho sakta hai",
    quiz_details: "Details →",
    quiz_retake: "Quiz dobara lein",
    quiz_empty: "Koi matching card nahi mila",
    quiz_fallback: "Aapke filters pe exact match nahi — ye closest hain.",
    quiz_disc_affiliate:
      "Apply links se commission mil sakta hai — ranking aapke benefit pe hai, payout pe nahi.",
    quiz_disc_advice:
      "Sirf jaankari ke liye, financial advice nahi. Approval issuer ki eligibility pe depend karta hai.",
    quiz_disc_redemption:
      "₹ value best-case redemption pe based hai (points/miles optimally redeem karne pe).",
    quiz_freshness: "Card data last updated: {date}",

    // Auth
    auth_signin: "Sign in",
    auth_signout: "Sign out",
    auth_plan_free: "Free",
    auth_plan_premium: "Premium",
    auth_blurb:
      "Sign in karke apna plan har device pe sync karo. Hum sirf naam & email lete hain — card number ya CVV kabhi nahi.",

    // News + Account
    nav_news: "News",
    nav_offers: "Offers",
    nav_admin: "Admin",
    nav_account: "Mera Account",
    news_title: "News & Updates",
    news_sub: "Credit card aur personal finance ki news, tips aur updates.",
    news_empty: "Abhi koi article nahi — jaldi wapas aao.",
    home_news_h: "Latest news",
    home_news_sub: "Credit card & finance updates",
    home_news_all: "Saari news",
  },

  hi: {
    // Navbar
    nav_home: "होम",
    nav_cards: "Cards",
    nav_pricing: "मूल्य",
    nav_how: "कैसे काम करता है",
    nav_contact: "संपर्क",
    nav_findcard: "Best Card खोजो",
    nav_ai: "AI",
    nav_add: "Chrome में जोड़ें",
    // Cards page / CardFinder
    cf_search_ph: "कार्ड या बैंक खोजें — जैसे 'HDFC', 'cashback', 'Amazon'…",
    cf_all_cards: "सभी कार्ड",
    cf_credit: "Credit",
    cf_debit: "Debit",
    cf_all_types: "सभी reward types",
    cf_type_cashback: "Cashback",
    cf_type_points: "Reward Points",
    cf_type_miles: "Travel Miles",
    cf_all_banks: "सभी banks",
    cf_all_categories: "सभी categories",
    cf_sort_reward: "Sort: सबसे ज़्यादा reward",
    cf_sort_fee: "Sort: सबसे कम fee",
    cf_sort_name: "Sort: नाम (A–Z)",
    cf_count: "{n} कार्ड मिले",
    cf_empty_filtered: "इन filters से कोई कार्ड नहीं मिला।",
    cf_empty_none: "कोई कार्ड नहीं मिला।",
    cf_clear_filters: "Filters clear करें",
    ci_top_reward: "top reward",
    ci_annual_fee: "annual fee",
    ci_best_for: "{cat} के लिए best",
    plan_tag_free: "शुरू करने के लिए — हमेशा free।",
    plan_tag_premium: "Regular shoppers के लिए।",
    plan_tag_pro: "Maximum बचत, power users के लिए।",

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

    // Home — explore (live entry points)
    explore_h: "CardWiz देखें",
    explore_sub: "हर tool एक click दूर।",
    xp_open: "खोलें →",
    xp_ai_t: "🤖 AI Card Assistant",
    xp_ai_d: "क्या खरीदना है? AI बताएगा कौनसा card best है।",
    xp_offers_t: "Bank Offers",
    xp_offers_d: "Live, community-verified credit card offers.",
    xp_find_t: "Best Card Finder",
    xp_find_d: "8 सवाल → आपका perfect card.",
    xp_cards_t: "Cards देखें",
    xp_cards_d: "195+ Indian cards reward-rate से compare करें।",
    xp_acct_t: "मेरा Account",
    xp_acct_d: "Savings report, transactions & cloud sync.",
    xp_news_t: "News & Guides",
    xp_news_d: "Latest card news, tips और best-card guides.",

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
      "By default आपका डेटा सिर्फ़ आपके device पर रहता है। Cloud Sync (optional, सिर्फ़ sign-in करने पर) limited card details sync करता है — type, nickname, last-4, due date। हम कभी भी आपका full card number, CVV, या bank login नहीं माँगते और नहीं store करते। यह हमारा core principle है।",
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
    pricing_h1_b: "चुनें",
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

    // Quiz — Find My Card
    quiz_teaser_title: "2 मिनट में अपना best credit card जानें",
    quiz_teaser_sub:
      "8 सवाल → personalised ₹-value recommendation. 🔒 आपके जवाब browser से बाहर नहीं जाते।",
    quiz_teaser_cta: "Quiz शुरू करें →",
    quiz_back: "पीछे",
    quiz_progress: "सवाल {n} / {total}",
    quiz_privacy: "आपके जवाब कभी इस browser से बाहर नहीं जाते।",
    quiz_calc: "आपके खर्च पर best cards निकाल रहे हैं…",
    quiz_q1_title: "सबसे बड़ा खर्च कहाँ? (#1)",
    quiz_q2_title: "उसके बाद दूसरा सबसे बड़ा? (#2)",
    quiz_cat_online: "Amazon / Flipkart / online shopping",
    quiz_cat_travel: "Flights, hotels & travel",
    quiz_cat_food: "Restaurants, Zomato, Swiggy",
    quiz_cat_daily: "Fuel + grocery + offline",
    quiz_cat_utility: "बिजली / recharge / insurance",
    quiz_cat_entertainment: "OTT & entertainment",
    quiz_q3_title: "Card से महीने का कुल खर्च?",
    quiz_q3_8000: "₹10,000 से कम",
    quiz_q3_20000: "₹10,000 – ₹30,000",
    quiz_q3_50000: "₹30,000 – ₹75,000",
    quiz_q3_120000: "₹75,000+",
    quiz_q4_title: "Card कहाँ ज़्यादा use होगा?",
    quiz_q4_domestic: "सिर्फ़ India में",
    quiz_q4_mixed: "India + कभी-कभी foreign",
    quiz_q4_international: "International travel frequent है",
    quiz_q4_business: "Business + travel",
    quiz_q5_title: "कौन सा reward best लगता है?",
    quiz_q5_cashback: "सीधा cashback account में",
    quiz_q5_points: "Points (Amazon/Flipkart पर redeem)",
    quiz_q5_miles: "Air miles + airport lounge",
    quiz_q5_premium: "Premium perks (dining, golf, concierge)",
    quiz_q6_title: "Annual fee कितनी acceptable है?",
    quiz_q6_0: "₹0 — Lifetime Free only",
    quiz_q6_1000: "₹1,000 तक ठीक है",
    quiz_q6_3000: "₹3,000 तक ठीक है",
    quiz_q6_999999: "Fee no bar — best card चाहिए",
    quiz_q7_title: "Credit card experience?",
    quiz_q7_beginner: "यह मेरा पहला card होगा",
    quiz_q7_1card: "1 card है",
    quiz_q7_experienced: "2–3 cards हैं",
    quiz_q7_expert: "4+ cards हैं",
    quiz_q8_title: "Approximate CIBIL score?",
    quiz_q8_unknown: "पता नहीं / पहला card",
    quiz_q8_low: "700 से कम",
    quiz_q8_good: "700 – 750",
    quiz_q8_excellent: "750+",
    quiz_results_title: "आपके लिए top picks",
    quiz_hero_badge: "Best match",
    quiz_ongoing_label: "अनुमानित सालाना value (आपके खर्च पर)",
    quiz_first_year: "First-year bonus ~₹{v}",
    quiz_fee_ltf: "Lifetime Free",
    quiz_fee_yr: "₹{v}/साल fee",
    quiz_fee_waived: "₹{v} spend पर fee waive",
    quiz_reason_reward: "{cat} पर {rate}% reward",
    quiz_reason_ltf: "Lifetime Free",
    quiz_reason_waived: "Spend पर fee waive हो सकती है",
    quiz_elig_flag: "750+ score से approval odds better",
    quiz_apply: "Apply ↗",
    quiz_apply_note: "*commission link हो सकता है",
    quiz_details: "Details →",
    quiz_retake: "Quiz दोबारा लें",
    quiz_empty: "कोई matching card नहीं मिला",
    quiz_fallback: "आपके filters पर exact match नहीं — ये closest हैं।",
    quiz_disc_affiliate:
      "Apply links से commission मिल सकता है — ranking आपके benefit पर है, payout पर नहीं।",
    quiz_disc_advice:
      "सिर्फ़ जानकारी के लिए, financial advice नहीं। Approval issuer की eligibility पर depend करता है।",
    quiz_disc_redemption:
      "₹ value best-case redemption पर based है (points/miles optimally redeem करने पर)।",
    quiz_freshness: "Card data last updated: {date}",

    // Auth
    auth_signin: "Sign in",
    auth_signout: "Sign out",
    auth_plan_free: "Free",
    auth_plan_premium: "Premium",
    auth_blurb:
      "Sign in करके अपना plan हर device पर sync करें। हम सिर्फ़ नाम & email लेते हैं — card number या CVV कभी नहीं।",

    // News + Account
    nav_news: "समाचार",
    nav_offers: "Offers",
    nav_admin: "Admin",
    nav_account: "मेरा Account",
    news_title: "News & Updates",
    news_sub: "Credit card और personal finance की news, tips और updates।",
    news_empty: "अभी कोई article नहीं — जल्दी वापस आएं।",
    home_news_h: "ताज़ा समाचार",
    home_news_sub: "Credit card & finance updates",
    home_news_all: "सारी news",
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
