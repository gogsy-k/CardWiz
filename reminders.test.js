/*
 * reminders.js date logic tests.  Chalao:  node reminders.test.js
 * Fixed "today" use karke deterministic results.
 */
const assert = require('assert');
const { nextDueDate, daysUntil, dueStatus, clampDay } = require('./reminders');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

console.log('CardWiz — Reminder Logic Tests\n');

// Aaj = 9 June 2026 (Tue). month index 5.
const today = new Date(2026, 5, 9);

test('dueDay 15 (future this month) -> 15 June', () => {
  assert.strictEqual(ymd(nextDueDate(15, today)), '2026-06-15');
});

test('dueDay 5 (past this month) -> 5 July (next month)', () => {
  assert.strictEqual(ymd(nextDueDate(5, today)), '2026-07-05');
});

test('dueDay 9 = today -> aaj hi (0 days)', () => {
  const d = nextDueDate(9, today);
  assert.strictEqual(ymd(d), '2026-06-09');
  assert.strictEqual(daysUntil(d, today), 0);
});

test('Feb clamp: dueDay 31, today 10 Feb 2026 -> 28 Feb (2026 non-leap)', () => {
  const feb = new Date(2026, 1, 10);
  assert.strictEqual(ymd(nextDueDate(31, feb)), '2026-02-28');
});

test('December rollover: dueDay 5, today 20 Dec -> 5 Jan next year', () => {
  const dec = new Date(2026, 11, 20);
  assert.strictEqual(ymd(nextDueDate(5, dec)), '2027-01-05');
});

test('clampDay 31 in April -> 30', () => {
  assert.strictEqual(clampDay(2026, 3, 31), 30); // April = month 3
});

// --- dueStatus levels ---
test('due today -> level "today"', () => {
  assert.strictEqual(dueStatus(9, 3, today).level, 'today');
});

test('due in 2 days, reminder 3 -> level "soon"', () => {
  const s = dueStatus(11, 3, today); // 11 June - 9 June = 2
  assert.strictEqual(s.days, 2);
  assert.strictEqual(s.level, 'soon');
});

test('due in 6 days, reminder 3 -> level "ok"', () => {
  const s = dueStatus(15, 3, today); // 6 days
  assert.strictEqual(s.level, 'ok');
});

test('default reminderDaysBefore = 3 jab null', () => {
  const s = dueStatus(12, null, today); // 3 days -> soon
  assert.strictEqual(s.level, 'soon');
});

console.log(`\n${passed} tests passed.`);
