/*
 * Indian bank statement PDF parser.
 *
 * Strategy: extract raw text → scan lines for date + amount patterns →
 * auto-classify merchant names.
 *
 * Tested against HDFC, SBI, ICICI, Axis formats. Accuracy varies — the frontend
 * review step lets users fix categories before importing.
 *
 * PRIVACY: This module receives a Buffer and returns parsed data. The raw PDF is
 * never written to disk or stored in any DB — caller's responsibility.
 */
'use strict';

// pdf-parse is an optional dep (only needed for statement upload feature).
let pdfParse;
try { pdfParse = require('pdf-parse'); } catch { pdfParse = null; }

// ── Merchant → category map ──────────────────────────────────────────────────
// Order matters: first match wins. More specific entries must come before generic.
const MERCHANT_CATS = [
  // Online shopping
  ['amazon', 'amazon'],
  ['flipkart', 'flipkart'],
  ['myntra', 'myntra'],
  ['meesho', 'online_shopping'],
  ['nykaa', 'online_shopping'],
  ['snapdeal', 'online_shopping'],
  ['tata cliq', 'online_shopping'],
  ['paytm mall', 'online_shopping'],
  ['shopsy', 'online_shopping'],

  // Food delivery
  ['swiggy', 'food_delivery'],
  ['zomato', 'food_delivery'],
  ['dunzo', 'food_delivery'],
  ['magicpin', 'food_delivery'],

  // Grocery
  ['blinkit', 'grocery'],
  ['bigbasket', 'grocery'],
  ['zepto', 'grocery'],
  ['jiomart', 'grocery'],
  ['dmart', 'grocery'],
  ['reliance smart', 'grocery'],
  ['reliance fresh', 'grocery'],
  ['grofers', 'grocery'],
  ['more supermarket', 'grocery'],
  ['spencer', 'grocery'],

  // Cabs / transport
  ['uber', 'uber'],
  ['rapido', 'uber'],
  ['ola cab', 'uber'],
  ['olacabs', 'uber'],

  // Travel
  ['irctc', 'travel'],
  ['makemytrip', 'travel'],
  ['goibibo', 'travel'],
  ['cleartrip', 'travel'],
  ['yatra', 'travel'],
  ['ixigo', 'travel'],
  ['redbus', 'travel'],

  // Flights
  ['indigo', 'flights'],
  ['air india', 'flights'],
  ['spicejet', 'flights'],
  ['vistara', 'flights'],
  ['go air', 'flights'],
  ['akasa', 'flights'],

  // Hotels
  ['oyo', 'hotels'],
  ['booking.com', 'hotels'],
  ['airbnb', 'hotels'],
  ['treebo', 'hotels'],
  ['fabhotel', 'hotels'],

  // Fuel
  ['hpcl', 'fuel'],
  ['bpcl', 'fuel'],
  ['iocl', 'fuel'],
  ['indian oil', 'fuel'],
  ['hp petrol', 'fuel'],
  ['bharat petroleum', 'fuel'],
  ['shell', 'fuel'],
  ['petrol', 'fuel'],
  ['fuel', 'fuel'],

  // Entertainment
  ['netflix', 'entertainment'],
  ['hotstar', 'entertainment'],
  ['disney+', 'entertainment'],
  ['jio cinema', 'entertainment'],
  ['sonyliv', 'entertainment'],
  ['zee5', 'entertainment'],
  ['spotify', 'entertainment'],
  ['youtube premium', 'entertainment'],
  ['amazon prime', 'entertainment'],
  ['bookmyshow', 'entertainment'],
  ['pvr', 'entertainment'],
  ['inox', 'entertainment'],

  // Utilities
  ['airtel', 'utilities'],
  ['jio recharge', 'utilities'],
  ['vi recharge', 'utilities'],
  ['bsnl', 'utilities'],
  ['electricity', 'utilities'],
  ['bescom', 'utilities'],
  ['tata power', 'utilities'],
  ['adani electricity', 'utilities'],
  ['msedcl', 'utilities'],
  ['water', 'utilities'],
  ['gas pipe', 'utilities'],

  // Education
  ['byju', 'education'],
  ['unacademy', 'education'],
  ['udemy', 'education'],
  ['coursera', 'education'],
  ['school fee', 'education'],
  ['college fee', 'education'],
  ['tuition', 'education'],

  // Insurance
  ['lic', 'insurance'],
  ['hdfc life', 'insurance'],
  ['icici pru', 'insurance'],
  ['star health', 'insurance'],
  ['bajaj allianz', 'insurance'],
  ['insurance', 'insurance'],

  // Rent
  ['nobroker', 'rent'],
  ['housing.com', 'rent'],
  ['rent payment', 'rent'],
  ['house rent', 'rent'],

  // Dining (physical restaurants — catch-all after delivery apps)
  ['restaurant', 'dining'],
  ['cafe', 'dining'],
  ['hotel food', 'dining'],
  ['dhaba', 'dining'],
];

function classifyMerchant(description) {
  const lower = (description || '').toLowerCase();
  for (const [kw, cat] of MERCHANT_CATS) {
    if (lower.includes(kw)) return cat;
  }
  return null;
}

// ── Text cleaning ────────────────────────────────────────────────────────────

// Remove UPI/NEFT/POS prefixes and trailing ref numbers.
function cleanDescription(raw) {
  return (raw || '')
    .replace(/^(UPI|NEFT|RTGS|IMPS|POS|ATM|ACH|ECS|NACH|IFT|BIL|CMS|INT|PUR|EMI|ECOM|DCF|TPT|MMT|CHQ|SBI|HDFC|ICICI|AXIS)\s*[-\/]/i, '')
    .replace(/\/\d{10,}/g, '')          // remove long ref numbers after /
    .replace(/\b[A-Z0-9]{12,}\b/g, '')  // remove long uppercase ref strings
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

// ── Date parsing ─────────────────────────────────────────────────────────────

const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function parseDate(token) {
  // DD/MM/YY[YY]
  let m = token.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let y = parseInt(m[3]); if (y < 100) y += 2000;
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  // DD-Mon-YY[YY] or DD Mon YY[YY]
  m = token.match(/^(\d{1,2})[\-\s]([A-Za-z]{3})[\-\s](\d{2,4})$/);
  if (m) {
    const mon = MONTH_MAP[m[2].toLowerCase()];
    if (mon) {
      let y = parseInt(m[3]); if (y < 100) y += 2000;
      return `${y}-${String(mon).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
  }
  return null;
}

// Regex to find a date token at/near start of a line
const DATE_RE = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}[\-\s][A-Za-z]{3}[\-\s]\d{2,4})/;

// Regex to find Indian-formatted numbers (1,50,000.00 or 150000.00)
const NUM_RE  = /(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/g;

function parseAmount(s) { return parseFloat(s.replace(/,/g, '')); }

// ── Core parser ──────────────────────────────────────────────────────────────

async function parseStatement(buffer) {
  if (!pdfParse) throw new Error('pdf-parse package not installed');

  const data = await pdfParse(buffer);
  const lines = data.text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 8);

  const transactions = [];

  for (const line of lines) {
    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;

    const date = parseDate(dateMatch[1]);
    if (!date) continue;

    // Sanity check: not future, not ancient
    const d = new Date(date);
    if (d > new Date() || d < new Date('2015-01-01')) continue;

    const rest = line.slice(dateMatch[0].length).trim();

    // Collect all numbers on the line
    const nums = [...rest.matchAll(NUM_RE)]
      .map((m) => ({ str: m[1], idx: m.index ?? 0, val: parseAmount(m[1]) }))
      .filter((n) => n.val >= 1);

    if (!nums.length) continue;

    // Determine debit amount
    const hasDR = /\bDR\b/i.test(rest);
    const hasCR = /\bCR\b/i.test(rest);

    let amount = null;
    if (hasDR && !hasCR) {
      // Amount immediately before "DR"
      const drIdx = rest.search(/\bDR\b/i);
      const before = nums.filter((n) => n.idx < drIdx);
      if (before.length) amount = before[before.length - 1].val;
    } else if (!hasCR) {
      // No DR/CR marker: heuristic — debit is second-to-last number (last is balance)
      if (nums.length >= 2) amount = nums[nums.length - 2].val;
      else amount = nums[0].val;
    }
    // hasCR only → credit/income → skip

    if (!amount || amount <= 0 || amount > 5_000_000) continue;

    // Extract description: text between date and first number
    const firstNumPos = nums.length ? rest.indexOf(nums[0].str) : rest.length;
    const rawDesc = rest.slice(0, firstNumPos)
      .replace(/\b\d{7,}\b/g, '')  // strip standalone ref numbers
      .trim();

    const merchant = cleanDescription(rawDesc);
    if (!merchant || merchant.length < 3) continue;

    // Skip obvious non-transactions
    const lower = merchant.toLowerCase();
    if (/^(opening|closing|balance|total|sub.total|carried|brought)/i.test(lower)) continue;

    transactions.push({
      date,
      merchant,
      amount: Math.round(amount * 100) / 100,
      category: classifyMerchant(merchant),
    });
  }

  // Remove duplicates (same date + amount + first 20 chars)
  const seen = new Set();
  return transactions.filter((t) => {
    const key = `${t.date}|${t.amount}|${t.merchant.slice(0, 20)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { parseStatement, classifyMerchant };
