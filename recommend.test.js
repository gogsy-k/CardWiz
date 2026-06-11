/*
 * recommend.js ke liye lightweight tests — koi framework nahi, sirf Node + assert.
 * Chalao:  node recommend.test.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { evaluateCard, recommend, topLine } = require('./recommend');
const C = require('./captracker');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'cards.json'), 'utf8'));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n      ${e.message}`);
    process.exitCode = 1;
  }
}

console.log('RewardXtra — Engine Tests\n');

// --- evaluateCard ---
const sbi = db.cards.find((c) => c.id === 'sbi-cashback');
const idfc = db.cards.find((c) => c.id === 'idfc-first-wealth');

test('Amazon pe SBI Cashback = 5%', () => {
  const r = evaluateCard(sbi, 'amazon', 1000);
  assert.strictEqual(r.rate, 5);
  assert.strictEqual(r.savings, 50);
  assert.strictEqual(r.capped, false);
});

test('SBI cap: ₹2000 cap pe clamp (50k online spend)', () => {
  const r = evaluateCard(sbi, 'amazon', 50000); // 5% = ₹2500 > ₹2000 cap
  assert.strictEqual(r.savings, 2000);
  assert.strictEqual(r.capped, true);
});

test('Exclusion: SBI pe fuel = 0 reward + excluded flag', () => {
  const r = evaluateCard(sbi, 'fuel', 5000);
  assert.strictEqual(r.savings, 0);
  assert.strictEqual(r.excluded, true);
});

test('Base rate fallback: SBI pe travel (no rule) = base 1%', () => {
  const r = evaluateCard(sbi, 'travel', 1000);
  assert.strictEqual(r.rate, 1);
  assert.strictEqual(r.savings, 10);
});

test('IDFC rent pe reward deta hai (rare!)', () => {
  const r = evaluateCard(idfc, 'rent', 10000);
  assert.ok(r.savings > 0, 'IDFC ko rent pe reward dena chahiye');
  assert.strictEqual(r.excluded, false);
});

// --- recommend (ranking) ---
test('Amazon (chhota ₹1000): Amex 10X (8%) top, cap ke andar', () => {
  const res = recommend(db, { category: 'amazon', amount: 1000 });
  assert.ok(res.length === db.cards.length, 'sab cards rank hone chahiye');
  assert.ok(res[0].savings >= res[1].savings, 'descending order');
  // ₹1000 pe Amex 8% = ₹80 (cap ₹200 ke andar), SBI/ICICI 5% = ₹50 se behtar.
  assert.strictEqual(res[0].id, 'amex-smartearn');
  assert.strictEqual(res[0].savings, 80);
});

test('Amazon (bada ₹50000): Amex cap kickin → 5% wala card aage nikle', () => {
  const res = recommend(db, { category: 'amazon', amount: 50000 });
  // Amex 8% = ₹4000 par cap ₹200 → sirf ₹200. ICICI 5% unlimited = ₹2500 jeet jaye.
  assert.notStrictEqual(res[0].id, 'amex-smartearn');
  assert.ok(res[0].savings > 200, 'cap-free card top hona chahiye');
  const amex = res.find((r) => r.id === 'amex-smartearn');
  assert.strictEqual(amex.capped, true);
});

test('Owned-cards filter sirf wallet ke cards rank kare', () => {
  const res = recommend(db, {
    category: 'amazon',
    amount: 1000,
    ownedCardIds: ['axis-ace', 'hdfc-infinia'],
  });
  assert.strictEqual(res.length, 2);
  const ids = res.map((r) => r.id).sort();
  assert.deepStrictEqual(ids, ['axis-ace', 'hdfc-infinia']);
});

test('Food delivery: Swiggy HDFC (10%) top hona chahiye', () => {
  const res = recommend(db, { category: 'food_delivery', amount: 500 });
  assert.strictEqual(res[0].id, 'hdfc-swiggy');
  assert.strictEqual(res[0].savings, 50); // 10% of 500
});

test('Empty category error throw kare', () => {
  assert.throws(() => recommend(db, { amount: 100 }));
});

test('topLine readable summary deta hai', () => {
  const res = recommend(db, { category: 'amazon', amount: 1000 });
  const line = topLine(res);
  assert.ok(line.includes('₹'), 'rupee symbol hona chahiye');
});

// --- Phase 5: cap tracking ---
const sbiOnlineRule = sbi.rules[0];
const capToday = new Date(2026, 5, 9);

test('Cap khatam -> base rate fallback + capExhausted flag', () => {
  const usage = C.logUsage(null, 'sbi-cashback', sbiOnlineRule, 2000, capToday); // poora cap use
  const r = evaluateCard(sbi, 'amazon', 1000, C.makeGetRemaining(usage, capToday));
  assert.strictEqual(r.capExhausted, true);
  assert.strictEqual(r.rate, 1);     // base rate
  assert.strictEqual(r.savings, 10); // 1% of 1000
});

test('Cap khatam re-ranks: SBI girta hai, doosra card jeetta', () => {
  const usage = C.logUsage(null, 'sbi-cashback', sbiOnlineRule, 2000, capToday);
  const res = recommend(db, {
    category: 'amazon', amount: 1000,
    ownedCardIds: ['sbi-cashback', 'amazon-pay-icici'],
    getRemaining: C.makeGetRemaining(usage, capToday),
  });
  // SBI ab base 1% (₹10), ICICI 5% (₹50) -> ICICI top
  assert.strictEqual(res[0].id, 'amazon-pay-icici');
  const sbiRes = res.find((r) => r.id === 'sbi-cashback');
  assert.strictEqual(sbiRes.capExhausted, true);
});

test('Cap partial: ₹40 bacha -> us purchase pe clamp', () => {
  const usage = C.logUsage(null, 'sbi-cashback', sbiOnlineRule, 1960, capToday); // 2000-1960=40 bacha
  const r = evaluateCard(sbi, 'amazon', 1000, C.makeGetRemaining(usage, capToday));
  assert.strictEqual(r.capExhausted, false); // abhi bacha hai
  assert.strictEqual(r.savings, 40);         // 5%=50 par sirf 40 cap bacha
  assert.strictEqual(r.capped, true);
});

console.log(`\n${passed} tests passed.`);
