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
const db = require('../db');

const router = express.Router();

// Frontend ko sirf yeh fields chahiye.
function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, picture: u.picture, plan: u.plan };
}

// --- Sign in / sign up (ek hi flow) ---
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    const profile = await verifyGoogleIdToken(idToken); // throws if invalid
    const user = await db.users.upsertByGoogleId(profile);
    const token = signSession(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.warn('[auth/google] reject:', err.message);
    res.status(401).json({ error: 'Google sign-in verify nahi hua' });
  }
});

// --- Who am I ---
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
