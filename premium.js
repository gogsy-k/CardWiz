/*
 * RewardXtra — Premium Tier Gating (Phase 6)
 * -----------------------------------------------
 * Free vs Premium feature gates. Pure logic — abhi koi payment backend nahi,
 * to premium ek storage flag hai (dev toggle se test kar sakte ho). Payment
 * integration baad ka kaam (Phase 7+).
 *
 * Product call: caps tracking FREE rakha (Edge #5 differentiator → adoption).
 * Premium = unlimited cards + spending analytics + (future) advanced features.
 */

const FREE_LIMITS = {
  maxCards: 3, // free tier: 3 cards tak wallet
};

// Premium-only features.
const PREMIUM_FEATURES = ['unlimited_cards', 'spending_analytics', 'multi_compare_export'];

const PREMIUM_MONTHLY_INR = 49;   // per month after trial
const PREMIUM_YEARLY_INR  = 299;  // per year (save ₹289 vs monthly)
const PREMIUM_TRIAL_DAYS  = 30;   // first month free
const PREMIUM_PRICE_INR   = PREMIUM_MONTHLY_INR; // backward compat

function isPremiumFeature(feature) {
  return PREMIUM_FEATURES.includes(feature);
}

// Kya user ye feature use kar sakta hai?
function canUseFeature(feature, isPremium) {
  return !!isPremium || !isPremiumFeature(feature);
}

// Free tier ne card-limit hit kar liya?
function cardLimitReached(currentCount, isPremium) {
  if (isPremium) return false;
  return currentCount >= FREE_LIMITS.maxCards;
}

// Aur kitne cards add kar sakte hain (Infinity = premium).
function cardsRemaining(currentCount, isPremium) {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_LIMITS.maxCards - currentCount);
}

// ---------- Exports (browser/worker/node) ----------
// unique const naam — classic scripts shared global scope mein collide na ho.
const premiumApi = {
  FREE_LIMITS, PREMIUM_FEATURES,
  PREMIUM_MONTHLY_INR, PREMIUM_YEARLY_INR, PREMIUM_TRIAL_DAYS,
  PREMIUM_PRICE_INR,
  isPremiumFeature, canUseFeature, cardLimitReached, cardsRemaining,
};
if (typeof module !== 'undefined' && module.exports) module.exports = premiumApi;
if (typeof globalThis !== 'undefined') globalThis.SmartCardPremium = premiumApi;
