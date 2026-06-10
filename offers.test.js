/*
 * offers.js parser tests — real-world Amazon/Flipkart offer strings.
 * Chalao:  node offers.test.js
 */
const assert = require('assert');
const { detectBank, parseOffer, offerValue, bestOffersByBank } = require('./offers');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('SmartCard Saver — Offer Parser Tests\n');

// --- detectBank ---
test('detectBank HDFC', () => assert.strictEqual(detectBank('10% off on HDFC Bank Credit Card'), 'HDFC'));
test('detectBank SBI word-boundary (not "sbicard typo")', () => assert.strictEqual(detectBank('Get SBI Credit Card offer'), 'SBI'));
test('detectBank none -> null', () => assert.strictEqual(detectBank('Free delivery today'), null));

// --- parseOffer: percent with cap ---
test('Amazon-style: 10% instant up to ₹1,500 HDFC Credit', () => {
  const o = parseOffer('10% Instant Discount up to ₹1,500 on HDFC Bank Credit Card EMI Transactions');
  assert.strictEqual(o.bank, 'HDFC');
  assert.strictEqual(o.kind, 'percent');
  assert.strictEqual(o.percent, 10);
  assert.strictEqual(o.cap, 1500);
  assert.strictEqual(o.creditOnly, true);
});

// --- parseOffer: flat off ---
test('Flat ₹500 off on ICICI Credit Card', () => {
  const o = parseOffer('Flat ₹500 off on ICICI Bank Credit Cards');
  assert.strictEqual(o.bank, 'ICICI');
  assert.strictEqual(o.kind, 'flat');
  assert.strictEqual(o.flat, 500);
});

// --- parseOffer: debit-only flagged ---
test('Debit card offer -> debitOnly true', () => {
  const o = parseOffer('5% off on SBI Bank Debit Card');
  assert.strictEqual(o.debitOnly, true);
  assert.strictEqual(o.creditOnly, false);
});

// --- parseOffer: no bank -> null ---
test('No bank mentioned -> null', () => {
  assert.strictEqual(parseOffer('No Cost EMI available'), null);
});

// --- parseOffer: No Cost EMI ---
test('No Cost EMI Axis -> kind nocostemi', () => {
  const o = parseOffer('No Cost EMI on Axis Bank Credit Card');
  assert.strictEqual(o.bank, 'Axis');
  assert.strictEqual(o.kind, 'nocostemi');
});

// --- offerValue ---
test('offerValue percent under cap', () => {
  const o = parseOffer('10% Instant Discount up to ₹1,500 on HDFC Bank Credit Card');
  assert.strictEqual(offerValue(o, 5000), 500); // 10% of 5000 = 500 < 1500
});
test('offerValue percent hits cap', () => {
  const o = parseOffer('10% Instant Discount up to ₹1,500 on HDFC Bank Credit Card');
  assert.strictEqual(offerValue(o, 50000), 1500); // 10% = 5000, capped 1500
});
test('offerValue flat', () => {
  const o = parseOffer('Flat ₹500 off on ICICI Bank Credit Cards');
  assert.strictEqual(offerValue(o, 3000), 500);
});
test('offerValue nocostemi -> 0', () => {
  const o = parseOffer('No Cost EMI on Axis Bank Credit Card');
  assert.strictEqual(offerValue(o, 10000), 0);
});

// --- bestOffersByBank: picks higher value, skips debit ---
test('bestOffersByBank dedupes per bank + skips debit', () => {
  const texts = [
    '5% off up to ₹250 on HDFC Bank Credit Card',
    '10% Instant Discount up to ₹1,500 on HDFC Bank Credit Card', // higher -> wins
    '5% off on SBI Bank Debit Card', // debit -> skip
  ];
  const best = bestOffersByBank(texts, 5000);
  assert.strictEqual(best.HDFC.value, 500);     // 10% of 5000
  assert.strictEqual(best.SBI, undefined);      // debit skipped
});

console.log(`\n${passed} tests passed.`);
