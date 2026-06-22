/*
 * User-submitted bank offers.
 *
 *   GET  /offers              — public, approved only. ?bank=&cardId=
 *   POST /offers/submit       — auth, 3 submissions/day rate limit
 *   GET  /offers/admin        — admin only, ?status=pending
 *   PATCH /offers/admin/:id   — admin only, { status: 'approved'|'rejected' }
 */
'use strict';

const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
const DAILY_LIMIT = 3;

function rateKey(userId) { return `offer:${userId}`; }
const _counts = new Map();
function checkLimit(userId) {
  const now = Date.now();
  let e = _counts.get(rateKey(userId));
  if (!e || now > e.resetAt) e = { count: 0, resetAt: now + 86_400_000 };
  if (e.count >= DAILY_LIMIT) return false;
  e.count++;
  _counts.set(rateKey(userId), e);
  return true;
}

// ── Public ───────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const { bank, cardId } = req.query;
  try {
    const list = await db.offers.list({ status: 'approved', bank, cardId });
    // Freshness: expired offers (validUntil < today) public list se hide.
    // validUntil null = no expiry (hamesha dikhao). Admin view sab dikhata hai.
    const today = new Date().toISOString().slice(0, 10);
    const fresh = list.filter((o) => !o.validUntil || o.validUntil >= today);
    res.json({ offers: fresh });
  } catch (err) {
    console.error('[offers GET]', err.message);
    res.status(502).json({ error: 'Could not load offers' });
  }
});

// ── Auth: submit ─────────────────────────────────────────────────────────────

router.post('/submit', requireAuth, async (req, res) => {
  if (!checkLimit(req.user.id)) {
    return res.status(429).json({ error: 'daily_limit', message: `Max ${DAILY_LIMIT} submissions per day` });
  }

  const { merchant, bank, cardId, title, discountText, validUntil } = req.body;
  if (!merchant?.trim()) return res.status(400).json({ error: 'merchant required' });
  if (!title?.trim())    return res.status(400).json({ error: 'title required' });
  if (!discountText?.trim()) return res.status(400).json({ error: 'discountText required' });

  try {
    const offer = await db.offers.create({
      merchant: merchant.trim().slice(0, 100),
      bank: bank?.trim().slice(0, 60) || null,
      cardId: cardId?.trim() || null,
      title: title.trim().slice(0, 120),
      discountText: discountText.trim().slice(0, 200),
      validUntil: validUntil || null,
      submittedBy: req.user.id,
      submittedByEmail: req.user.email,
    });
    res.status(201).json({ offer });
  } catch (err) {
    console.error('[offers/submit]', err.message);
    res.status(502).json({ error: 'Submit failed' });
  }
});

// ── Admin ────────────────────────────────────────────────────────────────────

router.get('/admin', requireAdmin, async (req, res) => {
  const status = req.query.status || 'pending';
  try {
    const list = await db.offers.list({ status, limit: 200 });
    res.json({ offers: list });
  } catch (err) {
    console.error('[offers/admin GET]', err.message);
    res.status(502).json({ error: 'Could not load offers' });
  }
});

router.patch('/admin/:id', requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved or rejected' });
  }
  try {
    const offer = await db.offers.updateStatus(req.params.id, status);
    if (!offer) return res.status(404).json({ error: 'Not found' });
    res.json({ offer });
  } catch (err) {
    console.error('[offers/admin PATCH]', err.message);
    res.status(502).json({ error: 'Update failed' });
  }
});

module.exports = router;
