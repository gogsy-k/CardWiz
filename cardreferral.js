/*
 * RewardXtra — Credit-card referral + Sponsored card (monetization).
 * --------------------------------------------------------------------
 * Free users se earning (bina display ads ke):
 *   1) "Apply for this card" referral links — user apply/approve hota hai to
 *      bank/aggregator humein commission deta hai. User ko koi extra cost nahi.
 *   2) Ek clearly-labelled "Sponsored" featured card. Premium = ad-free, to ye
 *      sirf FREE users ko dikhta hai.
 *
 * Pure logic, koi DOM nahi — Node mein testable.
 *
 * ⚠️ Neeche sab PLACEHOLDER hain. Real referral URLs / network IDs baad mein daalo:
 *    India networks: Cuelinks, INRDeals, CardExpert — ya direct bank affiliate program.
 */

// Per-card referral apply URL. Real link mile to cardId ke against yahan daalo.
// Yahan jo set hai woh use hoga; warna neeche getApplyUrl ka safe search-fallback.
const APPLY_URLS = {
  // 'hdfc-millennia':       'https://YOUR_AGGREGATOR/apply/hdfc-millennia?ref=YOUR_ID',
  // 'sbi-cashback':         'https://YOUR_AGGREGATOR/apply/sbi-cashback?ref=YOUR_ID',
  // 'axis-ace':             '...',
  // 'amazon-pay-icici':     '...',
  // 'flipkart-axis':        '...',
  // 'tataneu-infinity-hdfc':'...',
  // 'idfc-first-wealth':    '...',
  // 'axis-atlas':           '...',
  // 'hdfc-infinia':         '...',
  // 'hdfc-swiggy':          '...',
  // 'amex-smartearn':       '...',
};

const REFERRAL_CONFIG = {
  network: 'CardExpert',            // PLACEHOLDER — jo network use karoge
  affiliateId: 'YOUR_AFFILIATE_ID', // PLACEHOLDER
};

// Currently sponsored/featured card (paid placement). FREE users ko dikhega.
// ⚠️ PLACEHOLDER: launch se pehle apne asli sponsor ka cardId+blurb daalo,
//    YA cardId ko null kar do taaki koi sponsored banner na dikhe.
const FEATURED = {
  cardId: 'hdfc-millennia',
  blurb: 'Lifetime free · online shopping pe top cashback',
  applyUrl: '', // sponsored apply link (placeholder). Khaali = APPLY_URLS/fallback use hoga.
};

// NOTE: unique naam — affiliate.js mein bhi `DISCLOSURE` hai; popup mein dono classic
// scripts ek hi global scope share karte hain, to const naam collide nahi hona chahiye.
const REFERRAL_DISCLOSURE =
  '💡 Kuch "Apply"/Sponsored links referral hain — aap apply/approve hote ho to hame commission milta hai, aapko koi extra cost nahi.';

// Card apply ka referral URL. Explicit URL > nahi to Google-search fallback
// (safe + useful: card ke official apply page tak pahunchata hai). card = {id, name}.
function getApplyUrl(card) {
  if (!card || !card.id) return null;
  if (APPLY_URLS[card.id]) return APPLY_URLS[card.id];
  const q = (card.name || card.id) + ' credit card apply online';
  return 'https://www.google.com/search?q=' + encodeURIComponent(q);
}

function hasApply(card) {
  return !!getApplyUrl(card);
}

// Currently sponsored card — null agar koi sponsor configured nahi.
function getFeatured() {
  if (!FEATURED || !FEATURED.cardId) return null;
  return { cardId: FEATURED.cardId, blurb: FEATURED.blurb || '', applyUrl: FEATURED.applyUrl || '' };
}

function isSponsored(cardId) {
  return !!(FEATURED && FEATURED.cardId && FEATURED.cardId === cardId);
}

// Featured card ka apply URL — sponsored link (agar set) > normal referral/fallback.
function getFeaturedApplyUrl(card) {
  if (FEATURED && FEATURED.applyUrl) return FEATURED.applyUrl;
  return getApplyUrl(card);
}

// ---------- Exports (browser/node) ----------
const referralApi = {
  APPLY_URLS, REFERRAL_CONFIG, FEATURED,
  DISCLOSURE: REFERRAL_DISCLOSURE, // public API naam wahi (SmartCardReferral.DISCLOSURE)
  getApplyUrl, hasApply, getFeatured, isSponsored, getFeaturedApplyUrl,
};
if (typeof module !== 'undefined' && module.exports) module.exports = referralApi;
if (typeof globalThis !== 'undefined') globalThis.SmartCardReferral = referralApi;
