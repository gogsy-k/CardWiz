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
    lang_hint: 'App language. Card details stay in English.',
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
    lang_hint: 'App ki bhasha. Card details English mein rehte hain.',
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
    lang_hint: 'ऐप की भाषा। कार्ड की जानकारी अंग्रेज़ी में रहती है।',
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

const i18nApi = { LANGS, I18N, t, getLang, setLangValue, loadLang, saveLang, applyStaticI18n };
if (typeof module !== 'undefined' && module.exports) module.exports = i18nApi;
if (typeof globalThis !== 'undefined') globalThis.CardWizI18n = i18nApi;
