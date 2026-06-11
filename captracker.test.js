/*
 * captracker.js tests.  Chalao:  node captracker.test.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const C = require('./captracker');

const DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'cards.json'), 'utf8'));
const sbi = DB.cards.find((c) => c.id === 'sbi-cashback');
const sbiOnline = sbi.rules[0];                 // 5% online, cap ₹2000
const ace = DB.cards.find((c) => c.id === 'axis-ace');
const aceGpay = ace.rules.find((r) => r.categories.includes('utilities'));
const aceSwiggy = ace.rules.find((r) => r.categories.includes('food_delivery'));

const today = new Date(2026, 5, 9); // 9 June 2026

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('RewardXtra — Cap Tracker Tests\n');

test('currentPeriod format YYYY-MM', () => {
  assert.strictEqual(C.currentPeriod(today), '2026-06');
});

test('ruleKey: base rule', () => {
  assert.strictEqual(C.ruleKey('x', { base: true }), 'x::base');
});

test('ruleKey: shared capGroup (Axis ACE GPay & Swiggy same bucket)', () => {
  assert.strictEqual(C.ruleKey('axis-ace', aceGpay), 'axis-ace::ace-accelerated');
  assert.strictEqual(C.ruleKey('axis-ace', aceGpay), C.ruleKey('axis-ace', aceSwiggy));
});

test('remaining: full cap jab koi usage nahi', () => {
  assert.strictEqual(C.remaining(null, sbi, sbiOnline, today), 2000);
});

test('remaining: unlimited rule -> null', () => {
  const icici = DB.cards.find((c) => c.id === 'amazon-pay-icici');
  const amazonRule = icici.rules.find((r) => r.categories.includes('amazon'));
  assert.strictEqual(C.remaining(null, icici, amazonRule, today), null);
});

test('logUsage ghatata hai remaining', () => {
  const u = C.logUsage(null, 'sbi-cashback', sbiOnline, 500, today);
  assert.strictEqual(C.remaining(u, sbi, sbiOnline, today), 1500);
});

test('cap se zyada log -> remaining 0 (floor)', () => {
  const u = C.logUsage(null, 'sbi-cashback', sbiOnline, 3000, today);
  assert.strictEqual(C.remaining(u, sbi, sbiOnline, today), 0);
});

test('shared cap: GPay pe log karne se Swiggy ka bhi remaining ghata', () => {
  const u = C.logUsage(null, 'axis-ace', aceGpay, 300, today); // ₹500 cap, 300 used
  assert.strictEqual(C.remaining(u, ace, aceSwiggy, today), 200); // shared bucket
});

test('naya mahina -> auto reset', () => {
  const u = C.logUsage(null, 'sbi-cashback', sbiOnline, 1000, today);
  const nextMonth = new Date(2026, 6, 1); // July
  assert.strictEqual(C.remaining(u, sbi, sbiOnline, nextMonth), 2000); // reset
});

test('normalize purane period ko reset karta hai', () => {
  const stale = { period: '2026-05', used: { 'sbi-cashback::x': 999 } };
  const n = C.normalize(stale, today);
  assert.strictEqual(n.period, '2026-06');
  assert.deepStrictEqual(n.used, {});
});

console.log(`\n${passed} tests passed.`);
