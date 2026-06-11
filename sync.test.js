/*
 * sync.js tests.  Chalao:  node sync.test.js
 * mergeCards pure logic — cross-device merge (union by id, newer updatedAt jeete).
 */
const assert = require('assert');
const S = require('./sync');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

console.log('RewardXtra — Card Sync (merge) Tests\n');

const t1 = '2026-01-01T00:00:00.000Z';
const t2 = '2026-02-01T00:00:00.000Z';

test('local empty -> remote return', () => {
  const r = S.mergeCards([], [{ id: 'a', cardId: 'x', updatedAt: t1 }]);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].id, 'a');
});

test('remote empty -> local return', () => {
  const r = S.mergeCards([{ id: 'a', cardId: 'x', updatedAt: t1 }], []);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].id, 'a');
});

test('disjoint ids -> union (dono devices ke cards)', () => {
  const r = S.mergeCards(
    [{ id: 'a', cardId: 'x', updatedAt: t1 }],
    [{ id: 'b', cardId: 'y', updatedAt: t1 }]
  );
  assert.strictEqual(r.length, 2);
  assert.deepStrictEqual(r.map((c) => c.id).sort(), ['a', 'b']);
});

test('same id, local newer -> local jeete', () => {
  const r = S.mergeCards(
    [{ id: 'a', cardId: 'NEW', updatedAt: t2 }],
    [{ id: 'a', cardId: 'OLD', updatedAt: t1 }]
  );
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].cardId, 'NEW');
});

test('same id, remote newer -> remote jeete', () => {
  const r = S.mergeCards(
    [{ id: 'a', cardId: 'OLD', updatedAt: t1 }],
    [{ id: 'a', cardId: 'NEW', updatedAt: t2 }]
  );
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].cardId, 'NEW');
});

test('same id, tie -> local jeete (a >= b)', () => {
  const r = S.mergeCards(
    [{ id: 'a', cardId: 'LOCAL', updatedAt: t1 }],
    [{ id: 'a', cardId: 'REMOTE', updatedAt: t1 }]
  );
  assert.strictEqual(r[0].cardId, 'LOCAL');
});

test('bina id wale entries skip', () => {
  const r = S.mergeCards(
    [{ cardId: 'noId' }, { id: 'a', cardId: 'x', updatedAt: t1 }],
    [null, { id: 'b', cardId: 'y', updatedAt: t1 }]
  );
  assert.deepStrictEqual(r.map((c) => c.id).sort(), ['a', 'b']);
});

test('missing updatedAt = sabse purana (remote with time jeete)', () => {
  const r = S.mergeCards(
    [{ id: 'a', cardId: 'LOCAL' }],
    [{ id: 'a', cardId: 'REMOTE', updatedAt: t1 }]
  );
  assert.strictEqual(r[0].cardId, 'REMOTE');
});

test('null/undefined inputs safe', () => {
  assert.deepStrictEqual(S.mergeCards(null, null), []);
  assert.strictEqual(S.mergeCards(undefined, [{ id: 'a' }]).length, 1);
});

console.log(`\n${passed} tests passed.`);
