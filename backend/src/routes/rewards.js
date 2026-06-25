/*
 * CardWiz Rewards routes.
 *   GET  /rewards          (Bearer) -> { points, history, earnRates, streak, checkedInToday, redeemOptions, plan, planUntil }
 *   POST /rewards/checkin  (Bearer) -> { awarded, points, streak, gotBonus }
 *   POST /rewards/redeem   (Bearer) { optionId } -> { ok, points, plan, planUntil }
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const {
  POINTS, STREAK_BONUS, REDEEM_OPTIONS, REASON_LABEL, istDateStr, computeStreak,
} = require('../lib/rewards');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [points, history, checkinDates] = await Promise.all([
      db.points.balance(req.user.id),
      db.points.history(req.user.id, 30),
      db.points.checkinDates(req.user.id),
    ]);
    res.json({
      points,
      history: history.map((h) => ({ ...h, label: REASON_LABEL[h.reason] || h.reason })),
      earnRates: POINTS,
      streak: computeStreak(checkinDates),
      checkedInToday: checkinDates.includes(istDateStr()),
      redeemOptions: REDEEM_OPTIONS,
      plan: req.user.plan,
      planUntil: req.user.planUntil || null,
    });
  } catch (err) {
    console.error('[rewards/get]', err.message);
    res.status(502).json({ error: 'Rewards fetch fail' });
  }
});

// Daily check-in: +points once per IST day; 7-day streak milestone gives a bonus.
router.post('/checkin', requireAuth, async (req, res) => {
  try {
    const today = istDateStr();
    const awarded = await db.points.award(req.user.id, { delta: POINTS.checkin, reason: 'checkin', refId: today });
    const streak = computeStreak(await db.points.checkinDates(req.user.id));
    const gotBonus = awarded && streak > 0 && streak % 7 === 0;
    if (gotBonus) {
      await db.points.award(req.user.id, { delta: STREAK_BONUS, reason: 'streak', refId: `streak-${streak}` });
    }
    const points = await db.points.balance(req.user.id);
    res.json({ awarded, points, streak, checkedInToday: true, gotBonus });
  } catch (err) {
    console.error('[rewards/checkin]', err.message);
    res.status(502).json({ error: 'Check-in fail' });
  }
});

// Redeem points for plan days.
router.post('/redeem', requireAuth, async (req, res) => {
  const opt = REDEEM_OPTIONS.find((o) => o.id === (req.body && req.body.optionId));
  if (!opt) return res.status(400).json({ error: 'invalid_option' });
  // Don't let an active (non-expiring) subscriber convert their plan into an expiring one.
  if (req.user.plan !== 'free' && !req.user.planUntil) {
    return res.status(409).json({ error: 'active_plan', message: 'You already have an active paid plan.' });
  }
  try {
    const balance = await db.points.balance(req.user.id);
    if (balance < opt.cost) return res.status(400).json({ error: 'insufficient', message: 'Not enough points.' });
    await db.points.award(req.user.id, { delta: -opt.cost, reason: 'redeem', refId: `redeem-${Date.now()}` });
    const user = await db.users.redeemPlanDays(req.user.id, opt.plan, opt.days);
    res.json({ ok: true, points: balance - opt.cost, plan: user.plan, planUntil: user.planUntil, option: opt });
  } catch (err) {
    console.error('[rewards/redeem]', err.message);
    res.status(502).json({ error: 'Redeem fail' });
  }
});

module.exports = router;
