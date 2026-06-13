/*
 * razorpay.js tests.  Chalao:  node razorpay.test.js
 * Webhook signature verify (pure crypto) — keys/network ki zaroorat nahi.
 */
const assert = require('assert');
const crypto = require('crypto');
const R = require('./backend/src/services/razorpay');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('RewardXtra — Razorpay signature Tests\n');

const secret = 'whsec_test_123';
const body = JSON.stringify({ event: 'payment_link.paid', x: 1 });
const goodSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

test('valid signature -> true', () => {
  assert.strictEqual(R.verifyWebhookSignature(body, goodSig, secret), true);
});
test('tampered body -> false', () => {
  assert.strictEqual(R.verifyWebhookSignature(body + 'x', goodSig, secret), false);
});
test('wrong signature -> false', () => {
  assert.strictEqual(R.verifyWebhookSignature(body, 'deadbeef', secret), false);
});
test('empty signature -> false', () => {
  assert.strictEqual(R.verifyWebhookSignature(body, '', secret), false);
});
test('missing secret -> false', () => {
  assert.strictEqual(R.verifyWebhookSignature(body, goodSig, ''), false);
});

console.log(`\n${passed} tests passed.`);
