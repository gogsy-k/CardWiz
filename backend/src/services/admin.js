/*
 * Admin role resolution. No stale `role` column — admin status is COMPUTED:
 *   isAdmin(email) = email ∈ config.superAdminEmails  OR  email ∈ admins table
 *
 * Email is always normalized (lowercase + trim) so comparison is consistent with
 * how super-admins are parsed (config.js) and how admins are stored (db). One
 * inconsistent compare = silent admin-check failure, so normalize everywhere.
 */
'use strict';

const { config } = require('../config');
const db = require('../db');

function norm(email) {
  return String(email || '').toLowerCase().trim();
}

function isSuperAdmin(email) {
  return config.superAdminEmails.includes(norm(email));
}

async function isAdminEmail(email) {
  const e = norm(email);
  if (!e) return false;
  if (config.superAdminEmails.includes(e)) return true;
  return db.admins.has(e);
}

module.exports = { norm, isSuperAdmin, isAdminEmail };
