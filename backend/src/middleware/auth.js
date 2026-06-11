/*
 * requireAuth middleware — protected routes pe lagao.
 * "Authorization: Bearer <token>" header se humara session JWT padho, verify karo,
 * DB se user load karo, req.user pe rakho. Token na ho / galat ho to 401.
 */
'use strict';

const { verifySession } = require('../services/jwt');
const db = require('../db');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });

  const payload = verifySession(token);
  if (!payload || !payload.uid) return res.status(401).json({ error: 'Invalid token' });

  const user = await db.users.findById(payload.uid);
  if (!user) return res.status(401).json({ error: 'User not found' });

  req.user = user;
  next();
}

module.exports = { requireAuth };
