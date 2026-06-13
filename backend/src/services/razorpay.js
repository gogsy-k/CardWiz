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

module.exports = { createPaymentLink, getPaymentLink, verifyWebhookSignature };
