/*
 * RewardXtra — Recommendation Engine (Phase 2)
 * -------------------------------------------------
 * Pure logic. Koi DOM, koi chrome API yahan nahi — taaki ye Node mein test ho
 * sake aur browser extension mein bhi same file chale.
 *
 * Core idea: diye gaye `category` + `amount` pe, har card ka effective reward
 * value nikaalo (exclusions + caps factor karke), phir cards ko savings ke
 * hisaab se rank karo.
 *
 * Sab cards `effectiveRate` (%) mein normalized hain (dekho data/cards.json),
 * isliye cashback / points / miles cards directly compare ho jaate hain.
 */

/**
 * Ek single card ke liye, di gayi category+amount pe reward nikaalo.
 *
 * @param {object} card    - cards.json ka ek card object
 * @param {string} category - normalized category (jaise "amazon", "fuel")
 * @param {number} amount   - purchase amount (₹)
 * @param {function} [getRemaining] - optional (card, rule) => remaining monthly cap (₹).
 *        Phase 5 cap-tracking ke liye. null/undefined = full cap (no usage tracking).
 * @returns {{rate, savings, capped, capExhausted, note, excluded}}
 */
function evaluateCard(card, category, amount, getRemaining) {
  // 1. Exclusion check — ye category bilkul reward nahi deti is card pe.
  if (Array.isArray(card.exclusions) && card.exclusions.includes(category)) {
    return { rate: 0, savings: 0, capped: false, capExhausted: false, note: 'Is category pe reward nahi', excluded: true, rule: null };
  }

  // 2. Best matching accelerated rule dhoondo.
  let best = null;
  for (const rule of card.rules || []) {
    if (rule.categories && rule.categories.includes(category)) {
      if (!best || rule.effectiveRate > best.effectiveRate) best = rule;
    }
  }

  // Synthetic base rule (cap-tracking + fallback ke liye).
  const baseRule = { base: true, effectiveRate: card.baseRate || 0, monthlyCapValue: card.baseMonthlyCapValue, categories: [] };

  // 3. Agar accelerated rule ka cap is mahine khatam → base rate pe fall back.
  let capExhausted = false;
  let chosen;
  if (best) {
    const rem = getRemaining ? getRemaining(card, best) : best.monthlyCapValue;
    if (rem != null && rem <= 0) { capExhausted = true; chosen = baseRule; }
    else chosen = best;
  } else {
    chosen = baseRule;
  }

  const rate = chosen.effectiveRate;
  let note;
  if (capExhausted) note = 'Accelerated cap khatam — ab base rate';
  else if (chosen.base) note = 'Base rate';
  else note = chosen.note || chosen.rawRate || '';

  // 4. Effective cap = remaining (cap-tracking on) ya full monthlyCapValue.
  const cap = getRemaining ? getRemaining(card, chosen)
                           : (chosen.base ? chosen.monthlyCapValue : chosen.monthlyCapValue);

  // 5. Gross reward, phir cap pe clamp.
  let savings = amount * (rate / 100);
  let capped = false;
  if (cap != null && savings > cap) { savings = cap; capped = true; }

  return {
    rate,
    savings: Math.round(savings * 100) / 100,
    capped,
    capExhausted,
    note,
    excluded: false,
    rule: chosen, // cap-tracking ke liye: UI isi bucket mein usage log karta hai
  };
}

/**
 * Saare (ya owned) cards ko rank karo best-savings-first.
 *
 * @param {object} db        - poora cards.json object ({cards: [...]})
 * @param {object} opts
 * @param {string} opts.category      - normalized category
 * @param {number} opts.amount        - purchase amount (₹)
 * @param {string[]} [opts.ownedCardIds] - agar diya, to sirf inhi card ids ko rank karo
 *                                          (Phase 1 wallet). Warna saare cards.
 * @param {function} [opts.getRemaining] - (card, rule) => remaining monthly cap (₹).
 *                                          Phase 5 cap-tracking. Warna full caps.
 * @returns {Array} ranked results, har ek: {id, name, bank, type, rate, savings, capped, capExhausted, note}
 */
function recommend(db, { category, amount, ownedCardIds, getRemaining } = {}) {
  if (!db || !Array.isArray(db.cards)) throw new Error('Invalid cards DB');
  if (!category) throw new Error('category zaroori hai');
  const amt = Number(amount) || 0;

  let pool = db.cards;
  if (Array.isArray(ownedCardIds) && ownedCardIds.length > 0) {
    const owned = new Set(ownedCardIds);
    pool = pool.filter((c) => owned.has(c.id));
  }

  const results = pool.map((card) => {
    const evalResult = evaluateCard(card, category, amt, getRemaining);
    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      type: card.type,
      ...evalResult,
    };
  });

  // Sort: zyada savings pehle; tie pe zyada rate; tie pe kam annual fee.
  results.sort((a, b) => {
    if (b.savings !== a.savings) return b.savings - a.savings;
    if (b.rate !== a.rate) return b.rate - a.rate;
    return 0;
  });

  return results;
}

/**
 * Top recommendation ka human-friendly summary (Hinglish), UI ke liye.
 * @returns {string} jaise "HDFC Millennia → ₹50 bachenge (5%)"
 */
function topLine(results) {
  if (!results || results.length === 0) return 'Koi card nahi mila';
  const top = results[0];
  if (top.savings <= 0) return `${top.name} → is category pe reward nahi`;
  const capNote = top.capped ? ' (cap tak)' : '';
  return `${top.name} → ₹${top.savings} bachenge (${top.rate}%)${capNote}`;
}

// Browser + Node dono mein chalne ke liye dual export.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluateCard, recommend, topLine };
}
if (typeof window !== 'undefined') {
  window.SmartCardEngine = { evaluateCard, recommend, topLine };
}
