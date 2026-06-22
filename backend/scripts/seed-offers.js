/*
 * One-off seed: populate the offers page with a curated set of REAL, evergreen
 * card-benefit offers (accurate as of seed time; no hard expiry so nothing goes stale).
 * Idempotent — skips an offer if an approved one with the same merchant+title already exists.
 *
 * Run:  cd backend && node scripts/seed-offers.js
 */
'use strict';

require('../src/config'); // loads .env (DATABASE_URL → driver selection)
const db = require('../src/db');

const OFFERS = [
  {
    merchant: 'Amazon', bank: 'ICICI', cardId: 'amazon-pay-icici',
    title: '5% unlimited cashback on Amazon — Amazon Pay ICICI',
    discountText: '5% for Prime members (3% non-Prime) on Amazon, no cap, auto-credited as Amazon Pay balance.',
  },
  {
    merchant: 'Flipkart', bank: 'Axis', cardId: 'flipkart-axis',
    title: '5% cashback on Flipkart — Flipkart Axis Card',
    discountText: '5% unlimited on Flipkart & Myntra, 4% on preferred partners (Swiggy, PVR, cleartrip), 1% elsewhere.',
  },
  {
    merchant: 'Online shopping', bank: 'SBI', cardId: 'sbi-cashback',
    title: '5% cashback on all online spends — SBI Cashback Card',
    discountText: '5% on any online merchant (no restriction), 1% offline. Up to ₹5,000 cashback/month.',
  },
  {
    merchant: 'Swiggy', bank: 'HDFC', cardId: 'hdfc-swiggy',
    title: '10% cashback on Swiggy — HDFC Swiggy Card',
    discountText: '10% on Swiggy (food, Instamart, Dineout, Genie), 5% on other online spends, 1% offline.',
  },
  {
    merchant: 'Amazon / Flipkart', bank: 'HDFC', cardId: 'hdfc-millennia',
    title: '5% cashback on 10+ merchants — HDFC Millennia',
    discountText: '5% cashback on Amazon, Flipkart, Swiggy, Zomato, Myntra, Uber & more; 1% on all other spends.',
  },
  {
    merchant: 'HDFC SmartBuy', bank: 'HDFC', cardId: 'hdfc-infinia',
    title: 'Up to 10X reward points via HDFC SmartBuy',
    discountText: 'Accelerated reward points on flights, hotels & gift-card purchases booked through the SmartBuy portal.',
  },
  {
    merchant: 'Travel', bank: 'Axis', cardId: 'axis-magnus',
    title: 'Premium travel rewards — Axis Magnus',
    discountText: 'Accelerated EDGE rewards, unlimited airport lounge access, and 1:1-ish transfer to airline/hotel partners.',
  },
  {
    merchant: 'Dining', bank: 'ICICI', cardId: 'icici-coral',
    title: 'Dining discounts via ICICI Culinary Treats',
    discountText: 'Up to 15% savings at partner restaurants through the ICICI Bank Culinary Treats programme.',
  },
];

async function main() {
  await db.init();
  console.log(`[seed-offers] driver=${db.kind}`);

  const existing = await db.offers.list({ status: 'approved', limit: 500 });
  const seen = new Set(existing.map((o) => `${o.merchant}|${o.title}`));

  let added = 0, skipped = 0;
  for (const o of OFFERS) {
    if (seen.has(`${o.merchant}|${o.title}`)) { skipped++; continue; }
    const created = await db.offers.create({
      merchant: o.merchant, bank: o.bank, cardId: o.cardId,
      title: o.title, discountText: o.discountText,
      validUntil: null, submittedBy: null, submittedByEmail: 'team@cardwiz.in',
    });
    await db.offers.updateStatus(created.id, 'approved');
    added++;
    console.log(`  + ${o.title}`);
  }

  const total = (await db.offers.list({ status: 'approved', limit: 500 })).length;
  console.log(`[seed-offers] done — added=${added} skipped=${skipped} totalApproved=${total}`);
  process.exit(0);
}

main().catch((err) => { console.error('[seed-offers] FAILED:', err); process.exit(1); });
