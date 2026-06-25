/*
 * CardWiz Rewards routes.
 *   GET /rewards  (Bearer) -> { points, history, earnRates }
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const { POINTS, REASON_LABEL } = require('../lib/rewards');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [points, history] = await Promise.all([
      db.points.balance(req.user.id),
      db.points.history(req.user.id, 30),
    ]);
    res.json({
      points,
      history: history.map((h) => ({ ...h, label: REASON_LABEL[h.reason] || h.reason })),
      earnRates: POINTS,
    });
  } catch (err) {
    console.error('[rewards/get]', err.message);
    res.status(502).json({ error: 'Rewards fetch fail' });
  }
});

module.exports = router;
