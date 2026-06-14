/*
 * Razorpay service (Phase 11) — Payment Links.
 * REST API (koi extra SDK nahi; node 20 global fetch + basic auth).
 *
 * Flow: payment link banao -> user tab mein pay kare -> hum link status poll karke
 * 'paid' confirm karte hain -> user premium. Koi card data hamare paas nahi aata —
 * payment poora Razorpay ke secure page pe hota hai.
 */
'use strict';

const crypto = require('crypto');
const { config } = require('../config');

const RZP_BASE = 'https://api.razorpay.com/v1';

function authHeader() {
  const token = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64');
  return 'Basic ' + token;
}

// Payment Link banao. amount = paise.
async function createPaymentLink({ amount, description, customer, notes }) {
  const res = await fetch(`${RZP_BASE}/payment_links`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      description: description || 'RewardXtra Premium',
      customer: customer || undefined,
      notify: { sms: false, email: false },
      reminder_enable: false,
      notes: notes || {},
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('link create: ' + ((data.error && data.error.description) || res.status));
  }
  return data; // { id: 'plink_...', short_url, status, ... }
}

// Link ka latest status (poll). 'paid' ho to payments[] mein payment_id milta hai.
async function getPaymentLink(id) {
  const res = await fetch(`${RZP_BASE}/payment_links/${id}`, {
    headers: { Authorization: authHeader() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('link fetch: ' + ((data.error && data.error.description) || res.status));
  }
  return data; // { status: 'paid'|'created'|..., payments: [...] }
}

// Webhook signature verify (production robustness). Pure crypto — testable.
function verifyWebhookSignature(rawBody, signature, secret) {
  const key = secret || config.razorpayWebhookSecret;
  if (!key) return false;
  const expected = crypto.createHmac('sha256', key).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ''));
  } catch {
    return false; // length mismatch etc.
  }
}

// ---- Subscriptions (recurring billing with free trial) ----

// Step 1: Plan banao (amount = paise, period = 'monthly'|'yearly', interval = 1).
async function createPlan({ amount, period, interval, name }) {
  const res = await fetch(`${RZP_BASE}/plans`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      period,
      interval,
      item: { name: name || 'RewardXtra Premium', amount, currency: 'INR' },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('plan create: ' + ((data.error && data.error.description) || res.status));
  return data; // { id: 'plan_...', period, interval, item, ... }
}

// Step 2: Subscription banao. startAt = unix timestamp of first charge (trial end).
async function createSubscription({ planId, startAt, notes, totalCount }) {
  const res = await fetch(`${RZP_BASE}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan_id: planId,
      total_count: totalCount || 120, // monthly=120 (10yr), yearly=10 (10yr)
      quantity: 1,
      start_at: startAt,
      customer_notify: 1,
      notes: notes || {},
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('subscription create: ' + ((data.error && data.error.description) || res.status));
  return data; // { id: 'sub_...', short_url, status: 'created', ... }
}

// Status check: 'authenticated' = card saved; 'active' = charging.
async function getSubscription(id) {
  const res = await fetch(`${RZP_BASE}/subscriptions/${id}`, {
    headers: { Authorization: authHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error('subscription fetch: ' + ((data.error && data.error.description) || res.status));
  return data;
}

module.exports = { createPaymentLink, getPaymentLink, verifyWebhookSignature, createPlan, createSubscription, getSubscription };
