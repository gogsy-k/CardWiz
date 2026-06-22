/*
 * Launch waitlist — public "notify me at launch" capture.
 *   POST /subscribe  { email }  → { ok, alreadySubscribed }
 *
 * Privacy: email PII. Stored only to send a launch update; confirmation email
 * includes an unsubscribe link. In-memory IP rate-limit to curb abuse.
 */
'use strict';

const express = require('express');
const db = require('../db');
const { sendLaunchConfirm } = require('../lib/email');

const router = express.Router();

// Simple per-IP rate limit (resets on restart): max 5 submits / hour.
const HOURLY_LIMIT = 5;
const _hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  let e = _hits.get(ip);
  if (!e || now > e.resetAt) e = { count: 0, resetAt: now + 3_600_000 };
  if (e.count >= HOURLY_LIMIT) return true;
  e.count++;
  _hits.set(ip, e);
  return false;
}

// Basic, defensive email check (not RFC-perfect — just sane).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
  const email = (req.body && req.body.email ? String(req.body.email) : '').trim().toLowerCase();

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'invalid_email', message: 'Sahi email daalein.' });
  }
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: 'rate_limit', message: 'Thodi der baad try karein.' });
  }

  try {
    const added = await db.launch.subscribe(email); // true = new, false = already subscribed
    // Send confirmation only for new subscribers (avoid re-mailing dupes). Best-effort.
    if (added) {
      sendLaunchConfirm({ to: email }).catch((e) => console.error('[subscribe email]', e.message));
    }
    return res.json({ ok: true, alreadySubscribed: !added });
  } catch (err) {
    console.error('[subscribe]', err.message);
    return res.status(502).json({ error: 'failed', message: 'Kuch issue aaya. Dobara try karein.' });
  }
});

module.exports = router;
