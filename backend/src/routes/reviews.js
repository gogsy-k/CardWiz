/*
 * Card Reviews routes.
 *
 *   GET  /reviews?cardId=   -> { reviews, avgRating, count }  (public)
 *   POST /reviews            -> { review }                     (auth required, 1 per card per user)
 *   DELETE /reviews/:id      -> { ok }                         (auth, own review only)
 *
 * Gating: reading always free. Writing = auth required but free (volume drives SEO + trust).
 * Premium badge shown on premium users' reviews (trust signal, not a gate).
 * Rate limit: 5 reviews per user per day — handled by express-rate-limit.
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// ── GET /reviews?cardId=hdfc-millennia ──
router.get('/', async (req, res) => {
  const { cardId } = req.query;
  if (!cardId) return res.status(400).json({ error: 'cardId required' });
  try {
    const reviews = await db.reviews.listForCard(cardId);
    const count = reviews.length;
    const avgRating = count > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : null;
    res.json({ reviews, avgRating, count });
  } catch (err) {
    console.error('[reviews/list]', err.message);
    res.status(502).json({ error: 'Reviews fetch fail' });
  }
});

// ── POST /reviews ──
router.post('/', requireAuth, async (req, res) => {
  const { cardId, rating, title, body } = req.body || {};
  if (!cardId || !rating) return res.status(400).json({ error: 'cardId and rating required' });
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ error: 'rating must be 1-5' });

  try {
    const review = await db.reviews.upsert({
      cardId,
      userId: req.user.id,
      userName: req.user.name,
      userPicture: req.user.picture,
      userPlan: req.user.plan,
      rating: r,
      title: title ? String(title).slice(0, 120) : null,
      body: body ? String(body).slice(0, 1000) : null,
    });
    res.json({ review });
  } catch (err) {
    console.error('[reviews/post]', err.message);
    res.status(502).json({ error: 'Review save fail' });
  }
});

// ── DELETE /reviews/:cardId ── (own review only)
router.delete('/:cardId', requireAuth, async (req, res) => {
  try {
    const ok = await db.reviews.remove(req.params.cardId, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Review not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[reviews/delete]', err.message);
    res.status(502).json({ error: 'Delete fail' });
  }
});

module.exports = router;
