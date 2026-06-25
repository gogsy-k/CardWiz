/*
 * Payment routes (Phase 11 — Razorpay premium upgrade).
 *
 *  POST /payment/order  (Bearer) -> { shortUrl, amount }
 *      Razorpay payment link banao; extension ise naye tab mein kholta hai.
 *
 *  POST /payment/verify (Bearer) -> { status, plan }
 *      User ke latest pending payment ka Razorpay status check; 'paid' ho to
 *      user ko premium kar do. (Polling — koi public webhook nahi chahiye.)
 *
 * Hum koi card number/CVV nahi chhuते — payment poora Razorpay ke page pe.
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { config, razorpayConfigured } = require('../config');
const rzp = require('../services/razorpay');
const db = require('../db');

const router = express.Router();

function ensureConfigured(res) {
  if (!razorpayConfigured()) {
    res.status(503).json({ error: 'Payments abhi setup nahi (Razorpay keys missing).' });
    return false;
  }
  return true;
}

// --- Upgrade: payment link banao ---
router.post('/order', requireAuth, async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const amount = config.premiumPriceInr * 100; // paise
    const link = await rzp.createPaymentLink({
      amount,
      description: 'CardWiz Premium',
      customer: { name: req.user.name || 'User', email: req.user.email },
      notes: { userId: req.user.id },
    });
    await db.payments.create(req.user.id, link.id, amount);
    res.json({ shortUrl: link.short_url, amount: config.premiumPriceInr });
  } catch (err) {
    console.error('[payment/order]', err.message);
    res.status(502).json({ error: 'Payment link nahi bana' });
  }
});

// --- Verify: paid ho to premium ---
router.post('/verify', requireAuth, async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const pending = await db.payments.findPending(req.user.id, 5);
    if (!pending.length) return res.json({ status: 'none', plan: req.user.plan });

    // Recent pending links check karo — koi bhi 'paid' mile to premium.
    // (User ne multiple Upgrade dabaye ho to bhi sahi link pakdega.)
    for (const p of pending) {
      const link = await rzp.getPaymentLink(p.linkId);
      if (link.status === 'paid') {
        const paymentId = (link.payments && link.payments[0] && link.payments[0].payment_id) || null;
        await db.payments.markPaid(p.id, paymentId);
        const user = await db.users.updatePlan(req.user.id, 'premium');
        return res.json({ status: 'paid', plan: user.plan });
      }
    }
    res.json({ status: 'pending', plan: req.user.plan });
  } catch (err) {
    console.error('[payment/verify]', err.message);
    res.status(502).json({ error: 'Verify fail' });
  }
});

// --- Subscribe: recurring plan with free trial ---
router.post('/subscribe', requireAuth, async (req, res) => {
  if (!ensureConfigured(res)) return;
  const isYearly = req.body.plan === 'yearly';
  const planType = isYearly ? 'yearly' : 'monthly';
  // Which paid tier? (Pro costs more; tier is carried in notes so verify sets the right plan.)
  const tier = req.body.tier === 'pro' ? 'pro' : 'premium';
  const tierName = tier === 'pro' ? 'Pro' : 'Premium';
  try {
    const monthly = tier === 'pro' ? config.proMonthlyInr : config.premiumMonthlyInr;
    const yearly = tier === 'pro' ? config.proYearlyInr : config.premiumYearlyInr;
    const amount = (isYearly ? yearly : monthly) * 100;

    const rzpPlan = await rzp.createPlan({
      amount,
      period: planType,
      interval: 1,
      name: `CardWiz ${tierName} (${isYearly ? 'Yearly' : 'Monthly'})`,
    });

    // Trial end = trialDays din baad (first charge date).
    const startAt = Math.floor(Date.now() / 1000) + config.premiumTrialDays * 86400;
    const sub = await rzp.createSubscription({
      planId: rzpPlan.id,
      startAt,
      totalCount: isYearly ? 10 : 120, // 10 years either way
      notes: { userId: req.user.id, plan: planType, tier },
    });

    await db.subscriptions.create(req.user.id, sub.id, planType);
    res.json({ shortUrl: sub.short_url, plan: planType, tier, trialDays: config.premiumTrialDays });
  } catch (err) {
    console.error('[payment/subscribe]', err.message);
    res.status(502).json({ error: 'Subscription nahi bana: ' + err.message });
  }
});

// --- Verify subscription: card save hua? to premium ---
router.post('/verify-subscription', requireAuth, async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const pending = await db.subscriptions.findPending(req.user.id, 5);
    if (!pending.length) return res.json({ status: 'none', plan: req.user.plan });

    for (const s of pending) {
      const sub = await rzp.getSubscription(s.subId);
      // 'authenticated' = card saved (trial active); 'active' = charging has started.
      if (sub.status === 'authenticated' || sub.status === 'active') {
        await db.subscriptions.markActive(s.subId);
        // Tier (premium/pro) was stored in the subscription notes at creation.
        const tier = (sub.notes && sub.notes.tier) || 'premium';
        const user = await db.users.updatePlan(req.user.id, tier);
        return res.json({ status: 'active', plan: user.plan });
      }
    }
    res.json({ status: 'pending', plan: req.user.plan });
  } catch (err) {
    console.error('[payment/verify-subscription]', err.message);
    res.status(502).json({ error: 'Verify fail' });
  }
});

module.exports = router;
