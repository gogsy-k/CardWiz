/*
 * RewardXtra — Bank Offer Parser (Phase 3 extension)
 * -------------------------------------------------------
 * Checkout page pe dikhne wale "Bank Offers / No Cost EMI" text ko parse karta hai:
 *   "10% Instant Discount up to ₹1,500 on HDFC Bank Credit Card EMI Transactions"
 *   -> { bank:'HDFC', kind:'percent', percent:10, cap:1500, creditOnly:true }
 *
 * Pure logic, koi DOM nahi — Node mein testable. PRINCIPLE: sirf PADHTA hai.
 */

// Text pattern -> canonical bank. Pehle 6 cards.json ke `bank` se match karte hain;
// baaki sirf display ke liye (un cards ka reward data hamare paas nahi).
const BANK_PATTERNS = [
  { bank: 'HDFC', re: /hdfc/i },
  { bank: 'ICICI', re: /icici/i },
  { bank: 'SBI', re: /\bsbi\b|state bank/i },
  { bank: 'Axis', re: /axis/i },
  { bank: 'IDFC FIRST', re: /idfc/i },
  { bank: 'American Express', re: /amex|american express/i },
  { bank: 'Kotak', re: /kotak/i },
  { bank: 'OneCard', re: /onecard|one card/i },
  { bank: 'RBL', re: /\brbl\b/i },
  { bank: 'Yes Bank', re: /yes bank/i },
  { bank: 'IndusInd', re: /indusind/i },
  { bank: 'Citi', re: /citi/i },
  { bank: 'Bank of Baroda', re: /bank of baroda|\bbob\b/i },
  { bank: 'Federal', re: /federal bank/i },
];

function detectBank(text) {
  for (const { bank, re } of BANK_PATTERNS) if (re.test(text)) return bank;
  return null;
}

function toNum(s) {
  if (!s) return null;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

/**
 * Ek offer string parse karo. Bank na mile to null.
 * @returns {null | {bank, kind, percent, flat, cap, creditOnly, debitOnly, raw}}
 */
function parseOffer(text) {
  if (!text) return null;
  const bank = detectBank(text);
  if (!bank) return null; // bina bank ke offer kaam ka nahi

  const isCredit = /credit\s*card/i.test(text);
  const isDebit = /debit\s*card/i.test(text);
  const noCostEmi = /no\s*cost\s*emi/i.test(text);

  const pct = text.match(/(\d+(?:\.\d+)?)\s*%/);
  const flat = text.match(/(?:flat\s*)?(?:₹|rs\.?|inr)\s*([\d,]+)\s*(?:off|cashback|discount|instant)/i);
  const cap = text.match(/up\s*to\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);

  let kind, percent = null, flatOff = null;
  if (pct) { kind = 'percent'; percent = parseFloat(pct[1]); }
  else if (flat) { kind = 'flat'; flatOff = toNum(flat[1]); }
  else if (noCostEmi) { kind = 'nocostemi'; }
  else { kind = 'other'; }

  return {
    bank,
    kind,
    percent,
    flat: flatOff,
    cap: cap ? toNum(cap[1]) : null,
    creditOnly: isCredit && !isDebit,
    debitOnly: isDebit && !isCredit,
    raw: text.replace(/\s+/g, ' ').trim().slice(0, 140),
  };
}

/**
 * Is purchase pe offer ki estimated ₹ value.
 * nocostemi/other ke liye 0 (₹ value model nahi karte).
 */
function offerValue(offer, amount) {
  if (!offer || !amount || amount <= 0) return 0;
  if (offer.kind === 'percent' && offer.percent) {
    let v = amount * (offer.percent / 100);
    if (offer.cap) v = Math.min(v, offer.cap);
    return Math.round(v);
  }
  if (offer.kind === 'flat' && offer.flat) return offer.flat;
  return 0;
}

/**
 * Offer texts list -> best offer per bank (₹ value ke hisaab se).
 * Debit-only offers credit-card recommender ke liye skip.
 * @returns {Object} { bankName: {offer, value} }
 */
function bestOffersByBank(texts, amount) {
  const byBank = {};
  for (const t of texts || []) {
    const o = parseOffer(t);
    if (!o || o.debitOnly) continue;
    const v = offerValue(o, amount);
    if (!byBank[o.bank] || v > byBank[o.bank].value) byBank[o.bank] = { offer: o, value: v };
  }
  return byBank;
}

// ---------- Exports (browser/worker/node) ----------
// unique const naam — classic scripts shared global scope mein collide na ho.
const offersApi = { detectBank, parseOffer, offerValue, bestOffersByBank };
if (typeof module !== 'undefined' && module.exports) module.exports = offersApi;
if (typeof globalThis !== 'undefined') globalThis.SmartCardOffers = offersApi;
