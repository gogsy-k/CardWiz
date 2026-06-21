/*
 * Auth middleware.
 *  requireAuth       — Bearer JWT -> req.user (any logged-in user).
 *  requireAdmin      — requireAuth + email is admin (super-admin or admins table).
 *  requireSuperAdmin — requireAuth + email is a config super-admin.
 * Admin status is computed (services/admin.js), not stored on the user.
 */
'use strict';

const { verifySession } = require('../services/jwt');
const { isAdminEmail, isSuperAdmin } = require('../services/admin');
const db = require('../db');

// Shared: read Bearer token, verify, load user → returns user or null (and sends 401).
async function loadUser(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) { res.status(401).json({ error: 'No token' }); return null; }

  const payload = verifySession(token);
  if (!payload || !payload.uid) { res.status(401).json({ error: 'Invalid token' }); return null; }

  const user = await db.users.findById(payload.uid);
  if (!user) { res.status(401).json({ error: 'User not found' }); return null; }

  return user;
}

async function requireAuth(req, res, next) {
  const user = await loadUser(req, res);
  if (!user) return;
  req.user = user;
  next();
}

async function requireAdmin(req, res, next) {
  const user = await loadUser(req, res);
  if (!user) return;
  if (!(await isAdminEmail(user.email))) return res.status(403).json({ error: 'Admin access required' });
  req.user = user;
  next();
}

async function requireSuperAdmin(req, res, next) {
  const user = await loadUser(req, res);
  if (!user) return;
  if (!isSuperAdmin(user.email)) return res.status(403).json({ error: 'Super-admin access required' });
  req.user = user;
  next();
}

// Optional: sets req.user if valid token, otherwise req.user = null. Never rejects.
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = null;
  if (token) {
    try {
      const payload = verifySession(token);
      if (payload && payload.uid) {
        const user = await db.users.findById(payload.uid);
        if (user) req.user = user;
      }
    } catch { /* invalid token — stay null */ }
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireSuperAdmin, optionalAuth };
