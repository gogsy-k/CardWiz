'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
const MAX_KEYWORDS = 10;

// ── Watchlist ─────────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const keywords = await db.watchlist.list(req.user.id);
    res.json({ keywords });
  } catch (err) {
    console.error('[watchlist GET]', err.message);
    res.status(502).json({ error: 'Failed to load' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const kw = (req.body.keyword || '').trim().toLowerCase();
  if (!kw || kw.length < 2) return res.status(400).json({ error: 'keyword must be at least 2 characters' });
  if (kw.length > 50) return res.status(400).json({ error: 'keyword too long' });

  const count = await db.watchlist.count(req.user.id);
  if (count >= MAX_KEYWORDS) {
    return res.status(400).json({ error: `Max ${MAX_KEYWORDS} keywords allowed` });
  }

  try {
    await db.watchlist.add(req.user.id, kw);
    const keywords = await db.watchlist.list(req.user.id);
    res.status(201).json({ keywords });
  } catch (err) {
    console.error('[watchlist POST]', err.message);
    res.status(502).json({ error: 'Failed to add' });
  }
});

router.delete('/:keyword', requireAuth, async (req, res) => {
  try {
    await db.watchlist.remove(req.user.id, req.params.keyword);
    const keywords = await db.watchlist.list(req.user.id);
    res.json({ keywords });
  } catch (err) {
    console.error('[watchlist DELETE]', err.message);
    res.status(502).json({ error: 'Failed to remove' });
  }
});

// ── Notifications ─────────────────────────────────────────────────────────────

router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const list = await db.notifications.list(req.user.id, 20);
    res.json({ notifications: list });
  } catch (err) {
    console.error('[notifications GET]', err.message);
    res.status(502).json({ error: 'Failed to load' });
  }
});

router.post('/notifications/read', requireAuth, async (req, res) => {
  try {
    await db.notifications.markRead(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[notifications/read]', err.message);
    res.status(502).json({ error: 'Failed to mark read' });
  }
});

module.exports = router;
