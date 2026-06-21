/*
 * Reports — Missed Savings engine.
 *
 *   GET /reports/missed-savings?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * For each transaction:
 *   1. Look up effective rate for (used card, category)
 *   2. Find best rate across all wallet cards for that category
 *   3. missed = (bestRate - actualRate) * amount / 100
 *
 * Free users: full result returned (their ≤3 txns are tiny).
 *   `preview: true` flag tells the website to blur the breakdown.
 * Premium users: `preview: false` — full access.
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const { computeMissedSavings } = require('../lib/missed-savings');

const router = express.Router();

// ── Route ────────────────────────────────────────────────────────────────────

router.get('/missed-savings', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const isPremium = req.user.plan === 'premium';

  try {
    const [walletEntries, catalogCards, txns] = await Promise.all([
      db.cards.list(req.user.id),
      db.catalog.list(),
      db.transactions.list(req.user.id, { from, to }),
    ]);

    if (txns.length === 0 || walletEntries.length === 0) {
      return res.json({
        empty: true,
        preview: !isPremium,
        emptyReason: txns.length === 0 ? 'no_transactions' : 'no_wallet',
      });
    }

    const result = computeMissedSavings(txns, walletEntries, catalogCards);
    res.json({ ...result, empty: false, preview: !isPremium });
  } catch (err) {
    console.error('[reports/missed-savings]', err.message);
    res.status(502).json({ error: 'Report compute fail' });
  }
});

module.exports = router;
