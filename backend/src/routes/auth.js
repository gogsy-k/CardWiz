/*
 * Auth routes.
 *
 *  POST /auth/google  { idToken }  -> { token, user }
 *     Google ID token verify karo, user upsert karo, humara session JWT do.
 *
 *  GET  /auth/me      (Bearer token) -> { user }
 *     Current logged-in user. Extension startup pe "kaun logged in hai" check.
 *
 * Public user shape — koi internal/sensitive field bahar nahi.
 */
'use strict';

const express = require('express');
const { verifyGoogleIdToken } = require('../services/googleVerify');
const { signSession } = require('../services/jwt');
const { requireAuth } = require('../middleware/auth');
const { isAdminEmail } = require('../services/admin');
const db = require('../db');
const rewards = require('../lib/rewards');

const router = express.Router();

// Frontend ko sirf yeh fields chahiye. isAdmin computed (super-admin ya admins table).
async function publicUser(u) {
  return {
    id: u.id, email: u.email, name: u.name, picture: u.picture, plan: u.plan,
    planUntil: u.planUntil || null,
    referralCode: u.referralCode || null,
    isAdmin: await isAdminEmail(u.email),
  };
}

// --- Sign in / sign up (ek hi flow) ---
router.post('/google', async (req, res) => {
  try {
    const { idToken, ref } = req.body || {};
    const profile = await verifyGoogleIdToken(idToken); // throws if invalid
    const user = await db.users.upsertByGoogleId(profile);
    // Referral: reward the referrer (+100) once, only for a brand-new signup.
    if (user.isNew && ref) {
      try {
        const referrer = await db.users.findByReferralCode(ref);
        if (referrer && referrer.id !== user.id) {
          await rewards.award(referrer.id, 'referral', user.id); // refId = referee => once per friend
        }
      } catch (e) {
        console.error('[auth/referral]', e.message);
      }
    }
    const token = signSession(user.id);
    res.json({ token, user: await publicUser(user) });
  } catch (err) {
    console.warn('[auth/google] reject:', err.message);
    res.status(401).json({ error: 'Google sign-in verify nahi hua' });
  }
});

// --- Who am I ---
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: await publicUser(req.user) });
});

module.exports = router;
