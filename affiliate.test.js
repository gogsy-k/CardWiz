/*
 * affiliate.js tests.  Chalao:  node affiliate.test.js
 */
const assert = require('assert');
const { affiliateUrl, amazonLink, flipkartLink, cuelinksLink, DISCLOSURE } = require('./affiliate');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('RewardXtra — Affiliate Tests\n');

test('amazonLink adds tag', () => {
  const u = amazonLink('https://www.amazon.in/dp/B0XYZ', 'mytag-21');
  assert.ok(u.includes('tag=mytag-21'));
});

test('amazonLink existing query preserve karta hai', () => {
  const u = amazonLink('https://www.amazon.in/dp/B0XYZ?ref=abc', 'mytag-21');
  assert.ok(u.includes('ref=abc'));
  assert.ok(u.includes('tag=mytag-21'));
});

test('amazonLink existing tag replace karta hai (double-tag nahi)', () => {
  const u = amazonLink('https://www.amazon.in/dp/B0XYZ?tag=old-21', 'new-21');
  assert.ok(u.includes('tag=new-21'));
  assert.ok(!u.includes('old-21'));
});

test('flipkartLink adds affid', () => {
  const u = flipkartLink('https://www.flipkart.com/item/p/x', 'myaff');
  assert.ok(u.includes('affid=myaff'));
});

test('cuelinksLink wraps + encodes destination', () => {
  const u = cuelinksLink('https://www.myntra.com/x?a=1', 'CID123');
  assert.ok(u.startsWith('https://linksredirect.com/?cid=CID123'));
  assert.ok(u.includes(encodeURIComponent('https://www.myntra.com/x?a=1')));
});

test('cuelinksLink bina cid -> original', () => {
  assert.strictEqual(cuelinksLink('https://x.com', ''), 'https://x.com');
});

// --- affiliateUrl orchestration ---
test('affiliateUrl amazon -> Amazon Associates network', () => {
  const r = affiliateUrl('amazon', 'https://www.amazon.in/dp/B0XYZ');
  assert.strictEqual(r.affiliated, true);
  assert.strictEqual(r.network, 'Amazon Associates');
  assert.ok(r.url.includes('tag='));
});

test('affiliateUrl flipkart -> Flipkart Affiliate', () => {
  const r = affiliateUrl('flipkart', 'https://www.flipkart.com/x/p/y');
  assert.strictEqual(r.network, 'Flipkart Affiliate');
});

test('affiliateUrl myntra (cuelinks disabled default) -> not affiliated', () => {
  const r = affiliateUrl('myntra', 'https://www.myntra.com/x');
  assert.strictEqual(r.affiliated, false);
  assert.strictEqual(r.url, 'https://www.myntra.com/x');
});

test('affiliateUrl myntra with cuelinks enabled -> wrapped', () => {
  const cfg = { cuelinks: { cid: 'CID9', enabled: true } };
  const r = affiliateUrl('myntra', 'https://www.myntra.com/x', cfg);
  assert.strictEqual(r.affiliated, true);
  assert.strictEqual(r.network, 'Cuelinks');
});

test('disclosure hamesha present', () => {
  const r = affiliateUrl('amazon', 'https://www.amazon.in/dp/B0XYZ');
  assert.strictEqual(r.disclosure, DISCLOSURE);
  assert.ok(DISCLOSURE.toLowerCase().includes('extra cost') || DISCLOSURE.includes('commission'));
});

test('invalid URL gracefully handle', () => {
  const r = affiliateUrl('amazon', 'not-a-url');
  assert.ok(r.url); // crash nahi
});

console.log(`\n${passed} tests passed.`);
