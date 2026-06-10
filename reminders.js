/*
 * SmartCard Saver — Bill Reminder Logic (Phase 4)
 * -----------------------------------------------
 * Pure date math. Koi DOM/chrome API nahi — popup, background worker, aur Node
 * test, teeno mein same file chalti hai.
 *
 * PRINCIPLE: Sirf due-date yaad rakhta hai. Koi payment NAHI, koi bank login NAHI.
 */

// Mahine ka aakhri din (Feb clamp ke liye). month: 0-11.
function lastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// dueDay (1-31) ko valid din pe clamp karo (jaise 31 -> Feb mein 28).
function clampDay(year, month, day) {
  return Math.min(Math.max(1, day), lastDayOfMonth(year, month));
}

function atMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Aaj ke hisaab se agli bill due date nikaalo.
 * Agar is mahine ka dueDay aaj ya future mein hai -> is mahine. Warna agle mahine.
 * @param {number} dueDay - 1..31
 * @param {Date} today
 * @returns {Date} midnight pe set agli due date
 */
function nextDueDate(dueDay, today) {
  const t = atMidnight(today);
  const y = t.getFullYear();
  const m = t.getMonth();

  const thisMonth = atMidnight(new Date(y, m, clampDay(y, m, dueDay)));
  if (thisMonth >= t) return thisMonth;

  // Agla mahina (December rollover Date khud handle kar leta hai).
  const nm = new Date(y, m + 1, 1);
  return atMidnight(new Date(nm.getFullYear(), nm.getMonth(), clampDay(nm.getFullYear(), nm.getMonth(), dueDay)));
}

/** Do dates ke beech poore din (target - today). */
function daysUntil(target, today) {
  return Math.round((atMidnight(target) - atMidnight(today)) / 86400000);
}

/**
 * Ek card ki bill status.
 * @param {number} dueDay
 * @param {number} [reminderDaysBefore=3]
 * @param {Date} today
 * @returns {{due:Date, days:number, level:'today'|'soon'|'ok'}}
 */
function dueStatus(dueDay, reminderDaysBefore, today) {
  const before = (reminderDaysBefore == null) ? 3 : reminderDaysBefore;
  const due = nextDueDate(dueDay, today);
  const days = daysUntil(due, today);
  let level = 'ok';
  if (days <= 0) level = 'today';
  else if (days <= before) level = 'soon';
  return { due, days, level };
}

/** UI/notification ke liye Hinglish message. */
function reminderMessage(name, days) {
  if (days <= 0) return `Aaj ${name} ka bill due hai! 💳`;
  if (days === 1) return `${name} ka bill kal due hai`;
  return `${name} ka bill ${days} din mein due hai`;
}

// ---------- Exports (browser window + service worker self + node) ----------
// unique const naam — classic scripts shared global scope mein collide na ho.
const remindersApi = { lastDayOfMonth, clampDay, nextDueDate, daysUntil, dueStatus, reminderMessage };
if (typeof module !== 'undefined' && module.exports) module.exports = remindersApi;
if (typeof globalThis !== 'undefined') globalThis.SmartCardReminders = remindersApi;
