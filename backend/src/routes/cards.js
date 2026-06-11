/*
 * Cards routes (Phase 10 — cross-device sync).
 *
 *  GET /cards          (Bearer) -> { cards }   user ke synced cards
 *  PUT /cards { cards } (Bearer) -> { cards }   poora set replace (sync push)
 *
 * PRIVACY DEFENSE (server-side): last4 ko hamesha digits-only + last 4 tak truncate.
 * Client kuch bhi bheje, full card number / CVV YAHAN store nahi ho sakta.
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Ek incoming card ko safe shape mein laao (defense-in-depth).
function clean(c) {
  if (!c || typeof c !== 'object' || !c.id || !c.cardId) return null;
  const last4 = String(c.last4 || '').replace(/\D/g, '').slice(-4); // sirf last 4 digits
  const dueDay =
    Number.isInteger(c.dueDay) && c.dueDay >= 1 && c.dueDay <= 31 ? c.dueDay : null;
  const rdb =
    Number.isInteger(c.reminderDaysBefore) && c.reminderDaysBefore >= 0 && c.reminderDaysBefore <= 15
      ? c.reminderDaysBefore
      : null;
  return {
    id: String(c.id).slice(0, 64),
    cardId: String(c.cardId).slice(0, 64),
    nickname: String(c.nickname || '').slice(0, 40),
    last4,
    dueDay,
    reminderDaysBefore: rdb,
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : new Date().toISOString(),
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const cards = await db.cards.list(req.user.id);
    res.json({ cards });
  } catch (err) {
    console.error('[cards GET]', err.message);
    res.status(500).json({ error: 'Cards fetch fail' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const incoming = Array.isArray(req.body && req.body.cards) ? req.body.cards : [];
    const cleaned = incoming.map(clean).filter(Boolean).slice(0, 100); // sane cap
    // client_id pe dedupe (last wins) — DB ka UNIQUE(user_id, client_id) safe rahe.
    const byId = new Map();
    for (const c of cleaned) byId.set(c.id, c);
    const cards = await db.cards.replace(req.user.id, [...byId.values()]);
    res.json({ cards });
  } catch (err) {
    console.error('[cards PUT]', err.message);
    res.status(500).json({ error: 'Cards save fail' });
  }
});

module.exports = router;
