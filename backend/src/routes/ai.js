/*
 * AI Card Assistant route.
 *   POST /ai/chat   { query }   → { reply, topCards, categories, remaining }
 *
 * Rate limits (in-memory, resets on restart):
 *   Premium users  → unlimited
 *   Free logged-in → 5 queries / day
 *   Guests (no token) → 3 queries / day by IP
 */
'use strict';

const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const db = require('../db');
const { chat, checkRateLimit } = require('../lib/ai-assistant');
const { hasPremium } = require('../config');

const router = express.Router();

const FREE_LIMIT    = 5;
const GUEST_LIMIT   = 3;

router.post('/chat', optionalAuth, async (req, res) => {
  const query = (req.body.query || '').trim();
  if (!query || query.length < 3) return res.status(400).json({ error: 'Query too short' });
  if (query.length > 500)          return res.status(400).json({ error: 'Query too long (max 500 chars)' });

  const isPremium = hasPremium(req.user?.plan);
  const userId    = req.user?.id;
  let limitResult = { allowed: true, remaining: Infinity };

  if (!isPremium) {
    const key = userId ? `user:${userId}` : `ip:${req.ip}`;
    const max = userId ? FREE_LIMIT : GUEST_LIMIT;
    limitResult = checkRateLimit(key, max);
  }

  if (!limitResult.allowed) {
    return res.status(429).json({
      error: 'rate_limit',
      resetInHours: limitResult.resetInHours,
      message: `Daily limit reached. Try again in ${limitResult.resetInHours}h.`,
    });
  }

  // Resolve wallet (best-effort — guests have no wallet)
  let walletCards = [];
  if (userId) {
    try {
      const [entries, catalog] = await Promise.all([
        db.cards.list(userId),
        db.catalog.list(),
      ]);
      const byId = Object.fromEntries(catalog.map((c) => [c.id, c]));
      walletCards = entries.map((e) => byId[e.cardId]).filter(Boolean);
    } catch { /* ignore */ }
  }

  try {
    const catalogCards = userId ? (walletCards.length ? undefined : await db.catalog.list()) : await db.catalog.list();
    // Re-use the already-fetched catalog if we loaded it above
    const allCatalog = walletCards.length
      ? await db.catalog.list()   // need full catalog for pre-filter even if wallet loaded
      : catalogCards || await db.catalog.list();

    const result = await chat({ query, walletCards, catalogCards: allCatalog });
    return res.json({ ...result, remaining: limitResult.remaining, isPremium });
  } catch (err) {
    console.error('[ai/chat]', err.message);
    if (err.message?.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'ai_not_configured' });
    }
    return res.status(502).json({ error: 'AI service unavailable. Try again shortly.' });
  }
});

module.exports = router;
