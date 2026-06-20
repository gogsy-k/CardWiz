/*
 * CardWiz — Monthly Cap Tracker (Phase 5)
 * -----------------------------------------------
 * Har card ke har reward-rule ka monthly cap kitna "use" ho chuka hai, ye track
 * karta hai. Naye mahine pe khud reset. Engine isse "remaining cap" puchta hai
 * taaki cap khatam hone pe doosra card suggest ho.
 *
 * Manual logging: hum read-only hain, actual transactions nahi dekhte — user
 * "✓ Use kiya" dabake reward log karta hai. Honest + privacy-first.
 *
 * Pure logic, koi DOM/chrome nahi — Node mein testable.
 */

// "2026-06" — monthly period key (zyadatar caps statement/monthly hote hain).
function currentPeriod(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Ek rule ka stable cap-bucket key. Shared caps ke liye `capGroup` use hota hai
// (jaise Axis ACE: 5% GPay + 4% Swiggy ek hi ₹500 cap share karte hain).
function ruleKey(cardId, rule) {
  const bucket = rule.base
    ? 'base'
    : (rule.capGroup || (rule.categories || []).join(','));
  return `${cardId}::${bucket}`;
}

// usage object ko current period ke liye normalize karo — purana mahina to reset.
function normalize(usage, date) {
  const period = currentPeriod(date);
  if (!usage || usage.period !== period) return { period, used: {} };
  return usage;
}

function getUsed(usage, cardId, rule, date) {
  const u = normalize(usage, date);
  return u.used[ruleKey(cardId, rule)] || 0;
}

// Is rule pe is mahine kitna cap bacha. null = unlimited (koi cap nahi).
function remaining(usage, card, rule, date) {
  const cap = rule.base ? card.baseMonthlyCapValue : rule.monthlyCapValue;
  if (cap == null) return null;
  const used = getUsed(usage, card.id, rule, date);
  return Math.max(0, cap - used);
}

// Reward value log karo (naya usage object return — immutable style).
function logUsage(usage, cardId, rule, value, date) {
  const u = normalize(usage, date);
  const key = ruleKey(cardId, rule);
  const used = { ...u.used };
  used[key] = (used[key] || 0) + (Number(value) || 0);
  return { period: u.period, used };
}

// Saara usage clear (manual reset button ke liye).
function resetAll(date) {
  return { period: currentPeriod(date), used: {} };
}

// Engine ke liye ready-made callback: (card, rule) => remaining value.
function makeGetRemaining(usage, date) {
  return (card, rule) => remaining(usage, card, rule, date);
}

// ---------- Cumulative spend tracker (fee waiver + welcome bonus) ----------
// waiverSpend: { "card-id": totalINRSpend } — grows every time user clicks "Use kiya".
// Manual override stored separately on wallet card; this is just the tracked floor.
function totalTrackedSpend(waiverSpend, cardId) {
  return (waiverSpend && waiverSpend[cardId]) ? waiverSpend[cardId] : 0;
}

function addTrackedSpend(waiverSpend, cardId, amount) {
  const w = waiverSpend ? { ...waiverSpend } : {};
  w[cardId] = (w[cardId] || 0) + (Number(amount) || 0);
  return w;
}

// ---------- Exports (browser/worker/node) ----------
// NOTE: unique const naam (har module alag) — popup/content-script mein saare classic
// scripts ek hi global scope share karte hain, to `const api` collide kar jaata.
const capTrackerApi = { currentPeriod, ruleKey, normalize, getUsed, remaining, logUsage, resetAll, makeGetRemaining, totalTrackedSpend, addTrackedSpend };
if (typeof module !== 'undefined' && module.exports) module.exports = capTrackerApi;
if (typeof globalThis !== 'undefined') globalThis.CardWizCapTracker = capTrackerApi;
