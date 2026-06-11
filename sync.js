/*
 * RewardXtra — Card Sync (Phase 10).
 * --------------------------------------------------
 * Signed-in user ke cards backend (Supabase) se sync karta hai. Cloud Sync
 * DEFAULT ON hai (user More tab se OFF kar sakta hai). Sirf card type /
 * nickname / last-4 / due-date sync — poora card number / CVV KABHI nahi.
 *
 * Backend: GET /cards, PUT /cards (auth.js ka authedFetch — Bearer token).
 */

// ---------- pure merge (testable) ----------
// Union by entry 'id'; jiska updatedAt naya wo jeete. Cross-device data-loss se bachata hai.
function mergeCards(local, remote) {
  const byId = new Map();
  for (const c of remote || []) if (c && c.id) byId.set(c.id, c);
  for (const c of local || []) {
    if (!c || !c.id) continue;
    const ex = byId.get(c.id);
    if (!ex) { byId.set(c.id, c); continue; }
    const a = Date.parse(c.updatedAt) || 0;
    const b = Date.parse(ex.updatedAt) || 0;
    byId.set(c.id, a >= b ? c : ex); // tie -> local (a >= b)
  }
  return [...byId.values()];
}

// ---------- network ----------
async function pull() {
  const res = await SmartCardAuth.authedFetch('/cards', { method: 'GET' });
  if (!res.ok) throw new Error('pull fail ' + res.status);
  const data = await res.json();
  return Array.isArray(data.cards) ? data.cards : [];
}

async function push(cards) {
  const res = await SmartCardAuth.authedFetch('/cards', {
    method: 'PUT',
    body: JSON.stringify({ cards }),
  });
  if (!res.ok) throw new Error('push fail ' + res.status);
  const data = await res.json();
  return Array.isArray(data.cards) ? data.cards : [];
}

// Sign-in / startup pe: remote pull -> local ke saath merge -> merged push -> merged return.
// Dono taraf consistent ho jaate hain, bina kisi device ka data khoye.
async function syncNow(localCards) {
  const remote = await pull();
  const merged = mergeCards(localCards || [], remote);
  await push(merged);
  return merged;
}

// ---------- exports ----------
const syncApi = { mergeCards, pull, push, syncNow };
if (typeof module !== 'undefined' && module.exports) module.exports = syncApi;
if (typeof globalThis !== 'undefined') globalThis.SmartCardSync = syncApi;
