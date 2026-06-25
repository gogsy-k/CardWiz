/*
 * Manual Transactions routes.
 *
 *   GET    /transactions?from=YYYY-MM-DD&to=YYYY-MM-DD  → { transactions, count }  (auth)
 *   POST   /transactions                                 → { transaction }           (auth; free = limit 3)
 *   DELETE /transactions/:id                             → { ok }                   (auth, own only)
 *
 * Free plan: 3 transactions max — a taster that drives Missed Savings interest.
 * Premium: unlimited.
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const { hasPremium } = require('../config');
const rewards = require('../lib/rewards');

const router = express.Router();
const FREE_LIMIT = 3;

// ── GET /transactions ──
router.get('/', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  try {
    const txns = await db.transactions.list(req.user.id, { from, to });
    const count = await db.transactions.count(req.user.id);
    res.json({ transactions: txns, count, freeLimit: FREE_LIMIT });
  } catch (err) {
    console.error('[txn/list]', err.message);
    res.status(502).json({ error: 'Fetch fail' });
  }
});

// ── POST /transactions ──
router.post('/', requireAuth, async (req, res) => {
  const { cardId, date, merchant, amount, category, source } = req.body || {};

  if (!date || !amount || !category) {
    return res.status(400).json({ error: 'date, amount, category required' });
  }
  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  // Free plan limit check
  if (!hasPremium(req.user.plan)) {
    const count = await db.transactions.count(req.user.id);
    if (count >= FREE_LIMIT) {
      return res.status(403).json({ error: 'free_limit', limit: FREE_LIMIT, count });
    }
  }

  try {
    const txn = await db.transactions.create({
      userId: req.user.id,
      cardId: cardId || null,
      date: String(date).slice(0, 10),
      merchant: merchant ? String(merchant).slice(0, 200) : null,
      amount: Number(amount),
      category: String(category),
      source: source || 'manual',
    });
    rewards.award(req.user.id, 'transaction', txn.id); // +points (once per txn; bulk PDF import excluded)
    res.json({ transaction: txn });
  } catch (err) {
    console.error('[txn/create]', err.message);
    res.status(502).json({ error: 'Create fail' });
  }
});

// ── POST /transactions/bulk  (PDF import — premium only) ──
router.post('/bulk', requireAuth, async (req, res) => {
  if (!hasPremium(req.user.plan)) {
    return res.status(403).json({ error: 'premium_required' });
  }
  const { transactions, cardId } = req.body || {};
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: 'transactions array required' });
  }
  if (transactions.length > 500) {
    return res.status(400).json({ error: 'max 500 per batch' });
  }
  try {
    const created = [];
    for (const txn of transactions) {
      const { date, merchant, amount, category, source } = txn;
      if (!date || !amount || !category) continue;
      const t = await db.transactions.create({
        userId: req.user.id,
        cardId: txn.cardId || cardId || null,
        date: String(date).slice(0, 10),
        merchant: merchant ? String(merchant).slice(0, 200) : null,
        amount: Number(amount),
        category: String(category),
        source: source || 'pdf',
      });
      created.push(t);
    }
    res.json({ created: created.length, transactions: created });
  } catch (err) {
    console.error('[txn/bulk]', err.message);
    res.status(502).json({ error: 'Bulk create fail' });
  }
});

// ── DELETE /transactions/:id ──
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ok = await db.transactions.remove(req.params.id, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[txn/delete]', err.message);
    res.status(502).json({ error: 'Delete fail' });
  }
});

module.exports = router;
