/*
 * CardWiz — Background Service Worker (Phase 4)
 * ----------------------------------------------------
 * Roz do baar (chrome.alarms) bills check karta hai aur due-soon cards ke liye
 * browser notification deta hai. Ek din mein ek card pe ek hi notification.
 *
 * PRINCIPLE: Sirf yaad dilata hai. Koi payment NAHI.
 */

importScripts('reminders.js', 'i18n.js');
const R = globalThis.CardWizReminders;

const ALARM = 'scs-daily-bill-check';
const BACKEND = 'https://cardwiz-backend.onrender.com';
const AUTH_KEY = 'scsAuth';

function ensureAlarm() {
  chrome.alarms.create(ALARM, { periodInMinutes: 720 }); // har 12 ghante
  checkBills();
}

// Extension icon ka hover tooltip — stored language mein (browser start pe bhi sahi).
async function applyExtTitle() {
  try {
    await globalThis.CardWizI18n.loadLang();
    chrome.action.setTitle({ title: globalThis.CardWizI18n.t('ext_title') });
  } catch (_) { /* ignore */ }
}

function onBoot() { ensureAlarm(); applyExtTitle(); }

chrome.runtime.onInstalled.addListener(onBoot);
chrome.runtime.onStartup.addListener(onBoot);
// Language change hote hi tooltip update (popup se storage badalta hai).
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.cwLang) applyExtTitle();
});
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === ALARM) { checkBills(); checkOfferNotifications(); }
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

async function checkOfferNotifications() {
  try {
    const store = await chrome.storage.local.get([AUTH_KEY]);
    const auth = store[AUTH_KEY];
    if (!auth || !auth.token) return; // not signed in

    const res = await fetch(`${BACKEND}/watchlist/notifications`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (!res.ok) return;

    const { notifications } = await res.json();
    const unread = (notifications || []).filter((n) => !n.read);

    for (const n of unread) {
      chrome.notifications.create(`offer-${n.id}`, {
        type: 'basic',
        iconUrl: 'icon128.png',
        title: '🏷️ CardWiz — New Offer',
        message: n.message,
        priority: 1,
      });
    }

    if (unread.length > 0) {
      fetch(`${BACKEND}/watchlist/notifications/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
      }).catch(() => {});
    }
  } catch (_) { /* ignore network errors */ }
}

function todayString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "hdfc-millennia" -> "Hdfc Millennia" (nickname na ho to fallback)
function prettyCardId(id) {
  return String(id).split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
