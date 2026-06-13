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
      description: 'RewardXtra Premium',
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
    const pending = await db.payments.findLatestPending(req.user.id);
    if (!pending) return res.json({ status: 'none', plan: req.user.plan });

    const link = await rzp.getPaymentLink(pending.linkId);
    if (link.status === 'paid') {
      const paymentId = (link.payments && link.payments[0] && link.payments[0].payment_id) || null;
      await db.payments.markPaid(pending.id, paymentId);
      const user = await db.users.updatePlan(req.user.id, 'premium');
      return res.json({ status: 'paid', plan: user.plan });
    }
    res.json({ status: 'pending', plan: req.user.plan });
  } catch (err) {
    console.error('[payment/verify]', err.message);
    res.status(502).json({ error: 'Verify fail' });
  }
});

module.exports = router;
