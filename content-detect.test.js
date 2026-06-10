/*
 * content-detect.js ke pure helpers ke tests.  Chalao:  node content-detect.test.js
 */
const assert = require('assert');
const { detectSite, isCheckoutish, parseRupee } = require('./content-detect');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('SmartCard Saver — Content Detection Tests\n');

// --- detectSite ---
test('amazon.in -> amazon', () => {
  assert.deepStrictEqual(detectSite('www.amazon.in'), { merchant: 'Amazon', category: 'amazon' });
});
test('flipkart.com -> flipkart', () => {
  assert.strictEqual(detectSite('www.flipkart.com').category, 'flipkart');
});
test('myntra.com -> myntra', () => {
  assert.strictEqual(detectSite('www.myntra.com').category, 'myntra');
});
test('unknown site -> null', () => {
  assert.strictEqual(detectSite('www.google.com'), null);
});
test('lookalike domain (notflipkart-fake.in) -> null', () => {
  assert.strictEqual(detectSite('notflipkart-fake.in'), null);
});
test('phishing subdomain trick (amazon.in.evil.com) -> null', () => {
  assert.strictEqual(detectSite('amazon.in.evil.com'), null);
});
test('real subdomain (smile.amazon.in) -> amazon', () => {
  assert.strictEqual(detectSite('smile.amazon.in').category, 'amazon');
});

// --- isCheckoutish ---
test('cart page checkout-ish', () => {
  assert.strictEqual(isCheckoutish('/gp/cart/view.html'), true);
});
test('flipkart /viewcart checkout-ish', () => {
  assert.strictEqual(isCheckoutish('/viewcart?otracker=x'), true);
});
test('myntra /checkout/cart checkout-ish', () => {
  assert.strictEqual(isCheckoutish('/checkout/cart'), true);
});
test('product page NOT checkout-ish', () => {
  assert.strictEqual(isCheckoutish('/dp/B0XXXXX/some-product'), false);
});

// --- parseRupee ---
test('₹1,299.00 -> 1299', () => assert.strictEqual(parseRupee('₹1,299.00'), 1299));
test('Rs. 1299 -> 1299', () => assert.strictEqual(parseRupee('Rs. 1299'), 1299));
test('plain 2,499 -> 2499', () => assert.strictEqual(parseRupee('2,499'), 2499));
test('INR 599 -> 599', () => assert.strictEqual(parseRupee('INR 599'), 599));
test('empty -> null', () => assert.strictEqual(parseRupee(''), null));
test('no number -> null', () => assert.strictEqual(parseRupee('Free Delivery'), null));
test('zero -> null (invalid amount)', () => assert.strictEqual(parseRupee('₹0'), null));

console.log(`\n${passed} tests passed.`);
