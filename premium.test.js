/*
 * premium.js tests.  Chalao:  node premium.test.js
 */
const assert = require('assert');
const P = require('./premium');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('SmartCard Saver — Premium Gating Tests\n');

test('isPremiumFeature: unlimited_cards = premium', () => {
  assert.strictEqual(P.isPremiumFeature('unlimited_cards'), true);
});
test('isPremiumFeature: bill_reminders = free (not premium)', () => {
  assert.strictEqual(P.isPremiumFeature('bill_reminders'), false);
});

test('canUseFeature: free user analytics NAHI', () => {
  assert.strictEqual(P.canUseFeature('spending_analytics', false), false);
});
test('canUseFeature: premium user analytics HAAN', () => {
  assert.strictEqual(P.canUseFeature('spending_analytics', true), true);
});
test('canUseFeature: free user core feature (recommend) HAAN', () => {
  assert.strictEqual(P.canUseFeature('recommend', false), true);
});

test('cardLimitReached: free user 3 cards pe limit', () => {
  assert.strictEqual(P.cardLimitReached(3, false), true);
  assert.strictEqual(P.cardLimitReached(2, false), false);
});
test('cardLimitReached: premium user unlimited', () => {
  assert.strictEqual(P.cardLimitReached(50, true), false);
});

test('cardsRemaining: free user 2 cards -> 1 bacha', () => {
  assert.strictEqual(P.cardsRemaining(2, false), 1);
});
test('cardsRemaining: free user 5 cards -> 0 (negative nahi)', () => {
  assert.strictEqual(P.cardsRemaining(5, false), 0);
});
test('cardsRemaining: premium -> Infinity', () => {
  assert.strictEqual(P.cardsRemaining(10, true), Infinity);
});

console.log(`\n${passed} tests passed.`);
