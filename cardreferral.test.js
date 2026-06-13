/*
 * cardreferral.js tests.  Chalao:  node cardreferral.test.js
 * Referral apply URL + sponsored card logic (pure, no network).
 */
const assert = require('assert');
const R = require('./cardreferral');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('RewardXtra — Card Referral Tests\n');

test('getApplyUrl: search fallback mein card name hota hai', () => {
  const u = R.getApplyUrl({ id: 'hdfc-millennia', name: 'HDFC Millennia' });
  assert.ok(u.includes('google.com/search'));
  assert.ok(decodeURIComponent(u).includes('HDFC Millennia'));
});

test('getApplyUrl: explicit APPLY_URLS priority leta hai', () => {
  // APPLY_URLS empty hai by default; inject karke priority check karo.
  R.APPLY_URLS['test-card'] = 'https://ref.example/apply?ref=ABC';
  assert.strictEqual(R.getApplyUrl({ id: 'test-card', name: 'X' }), 'https://ref.example/apply?ref=ABC');
  delete R.APPLY_URLS['test-card'];
});

test('getApplyUrl: null/no-id card -> null', () => {
  assert.strictEqual(R.getApplyUrl(null), null);
  assert.strictEqual(R.getApplyUrl({ name: 'no id' }), null);
});

test('hasApply: card ke liye hamesha true (fallback)', () => {
  assert.strictEqual(R.hasApply({ id: 'x', name: 'X' }), true);
});

test('getFeatured + isSponsored consistent', () => {
  const f = R.getFeatured();
  if (f) {
    assert.ok(f.cardId);
    assert.strictEqual(R.isSponsored(f.cardId), true);
  } else {
    assert.strictEqual(f, null);
  }
  assert.strictEqual(R.isSponsored('definitely-not-a-card'), false);
});

test('getFeaturedApplyUrl: sponsored link > fallback', () => {
  const url = R.getFeaturedApplyUrl({ id: 'z', name: 'Z Card' });
  assert.ok(typeof url === 'string' && url.length > 0);
});

console.log(`\n${passed} tests passed.`);
