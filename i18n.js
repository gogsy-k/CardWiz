/*
 * CardWiz — i18n (language) engine.
 * --------------------------------------------------------------------
 * Language preference chrome.storage.local ('cwLang') mein. Default 'en'.
 * t(key) selected language ka string deta hai; missing key -> English fallback.
 * Static HTML: [data-i18n="key"] elements ka textContent set hota hai.
 *
 * Languages: English / Hinglish / Hindi.
 * Card data (names/rewards/features) translate NAHI hota — wo English mein hi.
 */

const LANGS = [
  { code: 'en',       label: 'English' },
  { code: 'hinglish', label: 'Hinglish' },
  { code: 'hi',       label: 'हिन्दी' },
];

// English = base + fallback. Missing keys -> English.
const I18N = {
  en: {
    nav_best: '🏆 Top Cards', nav_mycards: '💼 My Cards', nav_suggest: '💡 Suggest', nav_more: '⭐ More',
    best_title: '🏆 Some of the best cards in market',
    best_sub: 'Hand-picked top cards, scored by value. Tap ℹ️ Info for full details.',
    act_info: 'ℹ️ Info', act_apply: 'Apply ↗', act_apply_this: 'Apply for this card ↗',
    mc_add: '+ Add a new card', mc_credit: '💳 Credit', mc_debit: '🏧 Debit',
    sg_q: 'What are you buying?', sg_amount: 'Amount (₹)', sg_go: 'Show best card →',
    sg_onlymine: 'Show only my cards',
    md_features: '✨ Features', md_pros: '👍 Pros', md_cons: '👎 Cons', md_useful: '🎯 Useful for',
    cb_title: '📊 Check your CIBIL Score — Free', cb_btn: 'Check CIBIL Score — Free ↗',
    more_account: '👤 Account', more_language: '🌐 Language', more_sync: '☁️ Cloud Sync',
    more_premium: '⭐ Premium', more_about: 'ℹ️ About',
    act_edit: 'Edit', act_delete: 'Delete', act_pay: 'Pay ↗',
    mc_empty: 'No cards yet — add one below 👇',
    ext_title: 'CardWiz — find the best card',
    sg_privacy: '🔒 Your data stays only on this device — never on our server.',
    sg_results_empty: 'Pick a category and see the best card 👆',
    sg_caps_reset: 'Reset caps', sg_no_card: 'No card found',
    sg_no_reward: 'No reward in this category', sg_add_first: 'First add your cards in "💼 My Cards".',
    sg_used: '✓ Used this card', sg_reward: 'reward',
    cb_sub: 'Check your credit score at no charge. Important for loans/cards.',
    cb_p1: '✅ 100% free for you', cb_p2: "🔒 Secure — on the partner's verified page", cb_p3: '⚡ Score in 2 minutes',
    prem_p1: '♾️ Unlimited cards (free: up to 3)', prem_p2: '📊 Spending analytics', prem_p3: '🚀 Future advanced features',
    more_analytics: '📊 Spending Analytics', more_disclosure: '🤝 Disclosure',
    about_text: "🔒 India-first, privacy-first. Your data stays only on this device. We don't make payments or ask for card number/CVV.",
    about_privacy: '📄 Privacy Policy',
    acc_blurb: 'Sign in to sync your plan across devices. We only take name/email — never card number/CVV.',
    acc_signin: '🔵 Sign in with Google', acc_signing: 'Signing in…', acc_signout: 'Sign out',
    sync_signin: 'Sign in to turn on cloud sync — then log in on any browser and your cards are ready. 🔒 Only last-4, never the full number.',
    sync_on_msg: '✅ <b>ON</b> — your cards are synced to your account. Log in anywhere, everything is there.<br>🔒 Only card type, nickname, last-4 (not full number) and due date.',
    sync_off_btn: 'Turn cloud sync OFF',
    sync_off_msg: 'Cloud sync <b>OFF</b> — cards only on this device. Turn on to get them on every browser.',
    sync_on_btn: '☁️ Turn cloud sync ON',
    cards_synced: '☁️ Your cards are <b>synced</b> to your account (only last-4, not full number). Turn off from the More tab.',
    cards_local: '🔒 Your details are saved <b>only on this device</b>.<br>We <b>never</b> ask for / store the full card number or CVV.',
    prem_active: 'All features unlocked. Thank you! 🙏',
    prem_free: '1st month FREE, then ₹{m}/month · or ₹{y}/year (save ₹{s}!)',
    prem_upgrade: '⭐ 1st Month FREE — Upgrade',
    prem_note_active: 'Premium active — synced to your account, on every device.',
    prem_note_upgrade: '🌐 See all plans on cardwiz.in — opens when you tap Upgrade.',
    prem_note_out: 'Sign in for a real upgrade — or dev toggle (local test).',
    prem_dev_off: '↩ Back to Free (dev)', prem_dev_on: '⭐ Turn on Premium (dev)',
    an_locked: '🔒 Premium feature<br>See how much reward you earned on each card this month.',
    an_none: 'No rewards logged yet. Track via "✓ Used" on the Suggest tab.',
    an_total: 'Total reward this month',
    lang_hint: 'App language. Card names & websites stay in English.',
    why_extra: '+₹{d} vs next best card',
    cb_note: 'Free check via Paisabazaar · Your data stays on this device',
    cb_redirect: 'Opening Paisabazaar — CardWiz does not collect your data.',
    quiz_teaser_title: '🔍 Looking for a new card?',
    quiz_teaser_desc: 'Answer 8 questions & get a personalised recommendation.',
    quiz_teaser_cta: 'Find My Card →',
  },
  hinglish: {
    nav_best: '🏆 Top Cards', nav_mycards: '💼 Mere Cards', nav_suggest: '💡 Suggest', nav_more: '⭐ More',
    best_title: '🏆 Market ke kuch best cards',
    best_sub: 'Chuninda top cards, value ke hisaab se. Poori detail ke liye ℹ️ Info dabao.',
    act_info: 'ℹ️ Info', act_apply: 'Apply ↗', act_apply_this: 'Is card ke liye Apply karo ↗',
    mc_add: '+ Naya card add karo', mc_credit: '💳 Credit', mc_debit: '🏧 Debit',
    sg_q: 'Kya khareed rahe ho?', sg_amount: 'Amount (₹)', sg_go: 'Best card batao →',
    sg_onlymine: 'Sirf mere cards dikhao',
    md_features: '✨ Features', md_pros: '👍 Pros', md_cons: '👎 Cons', md_useful: '🎯 Useful for',
    cb_title: '📊 Apna CIBIL Score dekho — Free', cb_btn: 'CIBIL Score check karo — Free ↗',
    more_account: '👤 Account', more_language: '🌐 Bhasha', more_sync: '☁️ Cloud Sync',
    more_premium: '⭐ Premium', more_about: 'ℹ️ About',
    act_edit: 'Edit', act_delete: 'Delete', act_pay: 'Pay ↗',
    mc_empty: 'Abhi koi card nahi — neeche se add karo 👇',
    ext_title: 'CardWiz — best card batao',
    sg_privacy: '🔒 Aapka data sirf is device pe hai — hamare server pe nahi.',
    sg_results_empty: 'Category chuno aur best card dekho 👆',
    sg_caps_reset: 'Caps reset', sg_no_card: 'Koi card nahi mila',
    sg_no_reward: 'Is category pe reward nahi', sg_add_first: 'Pehle "💼 My Cards" mein apne cards add karo.',
    sg_used: '✓ Ye card use kiya', sg_reward: 'reward',
    cb_sub: 'Apna credit score dekho bina kisi charge ke. Loans/cards ke liye zaroori.',
    cb_p1: '✅ 100% free for you', cb_p2: '🔒 Secure — partner ke verified page pe', cb_p3: '⚡ 2 minute mein score',
    prem_p1: '♾️ Unlimited cards (free: 3 tak)', prem_p2: '📊 Spending analytics', prem_p3: '🚀 Future advanced features',
    more_analytics: '📊 Spending Analytics', more_disclosure: '🤝 Disclosure',
    about_text: '🔒 India-first, privacy-first. Aapka data sirf is device pe. Hum payment nahi karte, card number/CVV nahi maangte.',
    about_privacy: '📄 Privacy Policy',
    acc_blurb: 'Sign in karke apna plan sync karo + cross-device. Hum sirf naam/email lete hain — card number/CVV kabhi nahi.',
    acc_signin: '🔵 Sign in with Google', acc_signing: 'Sign in ho raha hai…', acc_signout: 'Sign out',
    sync_signin: 'Sign in karke cloud sync on karo — phir kisi bhi browser pe login karo, cards apne aap ready. 🔒 Sirf last-4, poora number nahi.',
    sync_on_msg: '✅ <b>ON</b> — aapke cards account se synced. Kahin bhi login karo, sab kuch wahin.<br>🔒 Sirf card type, nickname, last-4 (poora number nahi) aur due date.',
    sync_off_btn: 'Cloud sync OFF karo',
    sync_off_msg: 'Cloud sync <b>OFF</b> — cards sirf is device pe. On karo to har browser pe milenge.',
    sync_on_btn: '☁️ Cloud sync ON karo',
    cards_synced: '☁️ Aapke cards account se <b>synced</b> (sirf last-4, poora number nahi). More tab se off kar sakte ho.',
    cards_local: '🔒 Aapki details <b>sirf is device pe</b> save hain.<br>Hum full card number ya CVV <b>kabhi</b> nahi maangte/store karte.',
    prem_active: 'Saari features unlocked. Shukriya! 🙏',
    prem_free: '1st mahina FREE, phir ₹{m}/month · ya ₹{y}/year (save ₹{s}!)',
    prem_upgrade: '⭐ 1st Mahina FREE — Upgrade karo',
    prem_note_active: 'Premium active — account se synced, har device pe.',
    prem_note_upgrade: '🌐 Saare plans cardwiz.in pe — Upgrade dabate hi website khulegi.',
    prem_note_out: 'Sign in karke real upgrade — ya dev toggle (local test).',
    prem_dev_off: '↩ Free pe wapas (dev)', prem_dev_on: '⭐ Premium on karo (dev)',
    an_locked: '🔒 Premium feature<br>Is mahine kis card pe kitna reward kamaaya — dekho.',
    an_none: 'Abhi koi reward log nahi. Suggest tab pe "✓ Use kiya" se track karo.',
    an_total: 'Is mahine total reward',
    lang_hint: 'App ki bhasha. Card names & websites English mein rehte hain.',
    why_extra: '+₹{d} next se zyada',
    cb_note: 'Free check via Paisabazaar · Aapka data device pe hi rehta hai',
    cb_redirect: 'Paisabazaar pe ja rahe ho — CardWiz aapka data nahi leta.',
    quiz_teaser_title: '🔍 Naya card dhundh rahe ho?',
    quiz_teaser_desc: '8 sawaalon mein apna perfect card pata karo.',
    quiz_teaser_cta: 'Mera Card Dhundo →',
  },
  hi: {
    nav_best: '🏆 टॉप कार्ड', nav_mycards: '💼 मेरे कार्ड', nav_suggest: '💡 सुझाव', nav_more: '⭐ और',
    best_title: '🏆 बाज़ार के कुछ बेहतरीन कार्ड',
    best_sub: 'चुनिंदा टॉप कार्ड, वैल्यू के आधार पर। पूरी जानकारी के लिए ℹ️ Info दबाएँ।',
    act_info: 'ℹ️ जानकारी', act_apply: 'अप्लाई ↗', act_apply_this: 'इस कार्ड के लिए अप्लाई करें ↗',
    mc_add: '+ नया कार्ड जोड़ें', mc_credit: '💳 क्रेडिट', mc_debit: '🏧 डेबिट',
    sg_q: 'क्या खरीद रहे हैं?', sg_amount: 'राशि (₹)', sg_go: 'बेस्ट कार्ड बताएँ →',
    sg_onlymine: 'सिर्फ़ मेरे कार्ड दिखाएँ',
    md_features: '✨ फ़ीचर्स', md_pros: '👍 फ़ायदे', md_cons: '👎 नुकसान', md_useful: '🎯 किसके लिए सही',
    cb_title: '📊 अपना CIBIL स्कोर देखें — मुफ़्त', cb_btn: 'CIBIL स्कोर चेक करें — मुफ़्त ↗',
    more_account: '👤 अकाउंट', more_language: '🌐 भाषा', more_sync: '☁️ क्लाउड सिंक',
    more_premium: '⭐ प्रीमियम', more_about: 'ℹ️ परिचय',
    act_edit: 'एडिट', act_delete: 'डिलीट', act_pay: 'पे ↗',
    mc_empty: 'अभी कोई कार्ड नहीं — नीचे से जोड़ें 👇',
    ext_title: 'CardWiz — बेस्ट कार्ड बताएँ',
    sg_privacy: '🔒 आपका डेटा सिर्फ़ इसी डिवाइस पर है — हमारे सर्वर पर नहीं।',
    sg_results_empty: 'कैटेगरी चुनें और बेस्ट कार्ड देखें 👆',
    sg_caps_reset: 'Caps रीसेट', sg_no_card: 'कोई कार्ड नहीं मिला',
    sg_no_reward: 'इस कैटेगरी पर रिवॉर्ड नहीं', sg_add_first: 'पहले "💼 My Cards" में अपने कार्ड जोड़ें।',
    sg_used: '✓ यह कार्ड यूज़ किया', sg_reward: 'रिवॉर्ड',
    cb_sub: 'अपना credit score बिना किसी charge के देखें। Loans/cards के लिए ज़रूरी।',
    cb_p1: '✅ आपके लिए 100% free', cb_p2: '🔒 सुरक्षित — partner के verified page पर', cb_p3: '⚡ 2 मिनट में स्कोर',
    prem_p1: '♾️ अनलिमिटेड कार्ड (free: 3 तक)', prem_p2: '📊 Spending analytics', prem_p3: '🚀 आगे advanced features',
    more_analytics: '📊 Spending Analytics', more_disclosure: '🤝 Disclosure',
    about_text: '🔒 India-first, privacy-first. आपका डेटा सिर्फ़ इसी डिवाइस पर। हम payment नहीं करते, card number/CVV नहीं माँगते।',
    about_privacy: '📄 Privacy Policy',
    acc_blurb: 'Sign in करके अपना plan sync करें + cross-device. हम सिर्फ़ नाम/email लेते हैं — card number/CVV कभी नहीं।',
    acc_signin: '🔵 Google से Sign in', acc_signing: 'Sign in हो रहा है…', acc_signout: 'Sign out',
    sync_signin: 'Sign in करके cloud sync on करें — फिर किसी भी browser पर login करें, कार्ड अपने आप ready. 🔒 सिर्फ़ last-4, पूरा नंबर नहीं।',
    sync_on_msg: '✅ <b>ON</b> — आपके कार्ड account से synced. कहीं भी login करें, सब कुछ वहीं।<br>🔒 सिर्फ़ card type, nickname, last-4 (पूरा नंबर नहीं) और due date.',
    sync_off_btn: 'Cloud sync OFF करें',
    sync_off_msg: 'Cloud sync <b>OFF</b> — कार्ड सिर्फ़ इस डिवाइस पर। On करें तो हर browser पर मिलेंगे।',
    sync_on_btn: '☁️ Cloud sync ON करें',
    cards_synced: '☁️ आपके कार्ड account से <b>synced</b> (सिर्फ़ last-4, पूरा नंबर नहीं)। More tab से off कर सकते हैं।',
    cards_local: '🔒 आपकी details <b>सिर्फ़ इसी डिवाइस पर</b> save हैं।<br>हम full card number या CVV <b>कभी</b> नहीं माँगते/store करते।',
    prem_active: 'सारी features unlocked. शुक्रिया! 🙏',
    prem_free: 'पहला महीना FREE, फिर ₹{m}/month · या ₹{y}/year (बचाओ ₹{s}!)',
    prem_upgrade: '⭐ पहला महीना FREE — Upgrade करें',
    prem_note_active: 'Premium active — account से synced, हर device पर।',
    prem_note_upgrade: '🌐 सभी प्लान cardwiz.in पर — Upgrade दबाते ही वेबसाइट खुलेगी।',
    prem_note_out: 'Sign in करके real upgrade — या dev toggle (local test).',
    prem_dev_off: '↩ Free पर वापस (dev)', prem_dev_on: '⭐ Premium on करें (dev)',
    an_locked: '🔒 Premium feature<br>इस महीने किस कार्ड पर कितना रिवॉर्ड कमाया — देखें।',
    an_none: 'अभी कोई रिवॉर्ड log नहीं। Suggest tab पर "✓ यूज़ किया" से track करें।',
    an_total: 'इस महीने कुल रिवॉर्ड',
    lang_hint: 'ऐप की भाषा। कार्ड के नाम और वेबसाइट अंग्रेज़ी में रहते हैं।',
    why_extra: '+₹{d} अगले से ज़्यादा',
    cb_note: 'Free check via Paisabazaar · आपका डेटा इसी डिवाइस पर',
    cb_redirect: 'Paisabazaar पर जा रहे हैं — CardWiz आपका डेटा नहीं लेता।',
    quiz_teaser_title: '🔍 नया कार्ड ढूँढ रहे हैं?',
    quiz_teaser_desc: '8 सवालों में अपना परफ़ेक्ट कार्ड जानें।',
    quiz_teaser_cta: 'मेरा कार्ड ढूँढें →',
  },
};

let currentLang = 'en';

function getLang() { return currentLang; }
function setLangValue(code) { currentLang = (I18N[code] ? code : 'en'); }

// Selected language ka string; missing -> English fallback -> key.
function t(key) {
  const L = I18N[currentLang] || I18N.en;
  return (L && L[key]) || I18N.en[key] || key;
}

function loadLang() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) { setLangValue('en'); return resolve('en'); }
    chrome.storage.local.get(['cwLang'], (r) => { setLangValue(r.cwLang || 'en'); resolve(currentLang); });
  });
}

function saveLang(code) {
  setLangValue(code);
  if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ cwLang: currentLang });
}

// Static HTML: har [data-i18n] element ka textContent update karo.
function applyStaticI18n(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    const k = el.getAttribute('data-i18n');
    if (k) el.textContent = t(k);
  });
}

// Badge "best for" labels -> per-language. en/hinglish = English (common terms);
// hi = Devanagari. Brand names (Amazon/Flipkart) English hi rehte hain.
const BADGES = {
  hi: {
    'Travel': 'ट्रैवल', 'Air Miles': 'एयर माइल्स', 'Lounge': 'लाउंज', 'Points': 'पॉइंट्स',
    'Premium': 'प्रीमियम', 'Cashback': 'कैशबैक', 'Online Shopping': 'ऑनलाइन शॉपिंग', 'Shopping': 'शॉपिंग',
    'Bills': 'बिल', 'Food': 'फूड', 'Lifetime Free': 'लाइफटाइम फ्री', 'Rewards': 'रिवॉर्ड्स',
    'Dining': 'डाइनिंग', 'Entertainment': 'एंटरटेनमेंट', 'Grocery': 'ग्रॉसरी', 'Fuel': 'फ्यूल',
    'App-first': 'ऐप-फर्स्ट', 'Customisable': 'कस्टमाइज़ेबल',
  },
};

function tBadge(label) {
  const map = BADGES[currentLang];
  return (map && map[label]) || label;
}

const i18nApi = { LANGS, I18N, BADGES, t, tBadge, getLang, setLangValue, loadLang, saveLang, applyStaticI18n };
if (typeof module !== 'undefined' && module.exports) module.exports = i18nApi;
if (typeof globalThis !== 'undefined') globalThis.CardWizI18n = i18nApi;
