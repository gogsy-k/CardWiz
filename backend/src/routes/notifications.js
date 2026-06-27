/*
 * In-app notifications.
 *   GET  /notifications       (Bearer) -> { items, unread }
 *   POST /notifications/read  (Bearer) -> { ok }  (mark all read)
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await db.notifications.list(req.user.id, 20);
    res.json({ items, unread: items.filter((n) => !n.read).length });
  } catch (err) {
    console.error('[notifications/get]', err.message);
    res.status(502).json({ error: 'Notifications fail' });
  }
});

router.post('/read', requireAuth, async (req, res) => {
  try {
    await db.notifications.markRead(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[notifications/read]', err.message);
    res.status(502).json({ error: 'Mark read fail' });
  }
});

module.exports = router;
