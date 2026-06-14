/*
 * CardWiz — Background Service Worker (Phase 4)
 * ----------------------------------------------------
 * Roz do baar (chrome.alarms) bills check karta hai aur due-soon cards ke liye
 * browser notification deta hai. Ek din mein ek card pe ek hi notification.
 *
 * PRINCIPLE: Sirf yaad dilata hai. Koi payment NAHI.
 */

importScripts('reminders.js');
const R = globalThis.CardWizReminders;

const ALARM = 'scs-daily-bill-check';

function ensureAlarm() {
  chrome.alarms.create(ALARM, { periodInMinutes: 720 }); // har 12 ghante
  checkBills();
}

chrome.runtime.onInstalled.addListener(ensureAlarm);
chrome.runtime.onStartup.addListener(ensureAlarm);
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === ALARM) checkBills();
});

// Notification click -> popup ka Bills view... popup programmatically nahi khulta,
// to bas notification clear kar do.
chrome.notifications.onClicked.addListener((id) => chrome.notifications.clear(id));

async function checkBills() {
  const store = await chrome.storage.local.get(['myCards', 'notifiedOn']);
  const myCards = store.myCards || [];
  const notifiedOn = store.notifiedOn || {}; // { cardEntryId: 'YYYY-MM-DD' }

  const today = new Date();
  const todayKey = todayString(today);

  let changed = false;
  for (const mc of myCards) {
    if (!mc.dueDay) continue; // due date set nahi -> skip

    const { days, level } = R.dueStatus(mc.dueDay, mc.reminderDaysBefore, today);
    if (level === 'ok') continue;                 // abhi door hai
    if (notifiedOn[mc.id] === todayKey) continue; // aaj already bata diya

    const name = mc.nickname || prettyCardId(mc.cardId);
    chrome.notifications.create(`bill-${mc.id}-${todayKey}`, {
      type: 'basic',
      iconUrl: 'icon128.png',
      title: '💳 CardWiz — Bill Reminder',
      message: R.reminderMessage(name, days),
      priority: 2,
    });

    notifiedOn[mc.id] = todayKey;
    changed = true;
  }

  // Purane card-entries ke notifiedOn saaf karo (jo ab wallet mein nahi).
  const liveIds = new Set(myCards.map((c) => c.id));
  for (const id of Object.keys(notifiedOn)) {
    if (!liveIds.has(id)) { delete notifiedOn[id]; changed = true; }
  }

  if (changed) await chrome.storage.local.set({ notifiedOn });
}

function todayString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "hdfc-millennia" -> "Hdfc Millennia" (nickname na ho to fallback)
function prettyCardId(id) {
  return String(id).split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
