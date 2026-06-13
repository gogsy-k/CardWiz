/*
 * JSON-file user store — default driver (zero setup).
 * backend/data/users.json mein users array. Dev/MVP ke liye perfect:
 * koi DB install nahi, turant chal jaata hai, data restart ke baad bhi rehta hai.
 *
 * NOTE: full card number / CVV yahan bhi kabhi store nahi (plan ka core principle).
 * Production scale ke liye Postgres driver use karo (DATABASE_URL set karke).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'users.json');

let cache = null; // { users: [...] }

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(cache.users)) cache = { users: [] };
  } catch {
    cache = { users: [] }; // file nahi hai / corrupt -> fresh
  }
  if (!cache.cardsByUser || typeof cache.cardsByUser !== 'object') cache.cardsByUser = {};
  if (!Array.isArray(cache.payments)) cache.payments = [];
  return cache;
}

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cache, null, 2));
}

async function init() {
  load();
  persist(); // ensure file + data dir exist
}

// Google se aaya user — pehli baar ho to banao, warna profile refresh karo.
async function upsertByGoogleId({ googleId, email, name, picture }) {
  load();
  const now = new Date().toISOString();
  let u = cache.users.find((x) => x.googleId === googleId);
  if (u) {
    u.email = email;
    u.name = name;
    u.picture = picture;
    u.updatedAt = now;
  } else {
    u = {
      id: crypto.randomUUID(),
      googleId,
      email,
      name,
      picture,
      plan: 'free', // naya user hamesha free
      createdAt: now,
      updatedAt: now,
    };
    cache.users.push(u);
  }
  persist();
  return u;
}

async function findById(id) {
  load();
  return cache.users.find((x) => x.id === id) || null;
}

// Phase 9 (payment) ke liye ready — plan free/premium toggle.
async function updatePlan(id, plan) {
  load();
  const u = cache.users.find((x) => x.id === id);
  if (!u) return null;
  u.plan = plan;
  u.updatedAt = new Date().toISOString();
  persist();
  return u;
}

// ---- Cards (synced wallet) ----
async function listCards(userId) {
  load();
  return cache.cardsByUser[userId] || [];
}

async function replaceCards(userId, cards) {
  load();
  cache.cardsByUser[userId] = cards;
  persist();
  return cache.cardsByUser[userId];
}

// ---- Payments (premium upgrade) ----
async function createPayment(userId, linkId, amount) {
  load();
  const now = new Date().toISOString();
  const p = { id: crypto.randomUUID(), userId, linkId, paymentId: null, amount, status: 'created', createdAt: now, updatedAt: now };
  cache.payments.push(p);
  persist();
  return p;
}

async function findPendingPayments(userId, limit = 5) {
  load();
  return cache.payments
    .filter((p) => p.userId === userId && p.status === 'created')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) // newest first
    .slice(0, limit);
}

async function markPaymentPaid(id, paymentId) {
  load();
  const p = cache.payments.find((x) => x.id === id);
  if (!p) return null;
  p.status = 'paid';
  p.paymentId = paymentId;
  p.updatedAt = new Date().toISOString();
  persist();
  return p;
}

module.exports = {
  kind: 'json', init, upsertByGoogleId, findById, updatePlan, listCards, replaceCards,
  createPayment, findPendingPayments, markPaymentPaid,
};
