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
  if (!Array.isArray(cache.subscriptions)) cache.subscriptions = [];
  if (!Array.isArray(cache.posts)) cache.posts = [];
  if (!Array.isArray(cache.admins)) cache.admins = [];
  if (!Array.isArray(cache.reviews)) cache.reviews = [];
  if (!Array.isArray(cache.transactions)) cache.transactions = [];
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

// ---- Subscriptions (recurring + trial) ----
async function createSubscription(userId, subId, plan) {
  load();
  const now = new Date().toISOString();
  const s = { id: crypto.randomUUID(), userId, subId, plan, status: 'created', createdAt: now, updatedAt: now };
  cache.subscriptions.push(s);
  persist();
  return s;
}

async function findPendingSubscriptions(userId, limit = 5) {
  load();
  return cache.subscriptions
    .filter((s) => s.userId === userId && s.status === 'created')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

async function markSubscriptionActive(subId) {
  load();
  const s = cache.subscriptions.find((x) => x.subId === subId);
  if (!s) return null;
  s.status = 'active';
  s.updatedAt = new Date().toISOString();
  persist();
  return s;
}

// ---- Card Catalog (dev fallback — reads bundled cards.json) ----
const CARDS_JSON_PATH = path.join(__dirname, '..', '..', '..', '..', 'data', 'cards.json');

async function listCatalog() {
  try {
    const db = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
    return db.cards || [];
  } catch {
    return [];
  }
}

async function countCatalog() {
  return 1; // always positive so auto-seed is skipped for json driver
}

async function upsertCard() { /* no-op — json driver mein seeding nahi hoti */ }
async function deleteNotInCatalog() { return 0; /* no-op */ }

// ---- Posts (news/blog) ----
async function listPublishedPosts({ limit = 50, offset = 0 } = {}) {
  load();
  return cache.posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => {
      const ad = a.publishedAt || a.createdAt || '';
      const bd = b.publishedAt || b.createdAt || '';
      return ad < bd ? 1 : -1; // newest first
    })
    .slice(offset, offset + limit);
}

async function listAllPosts() {
  load();
  return [...cache.posts].sort((a, b) => ((a.updatedAt || '') < (b.updatedAt || '') ? 1 : -1));
}

async function getPostBySlug(slug) {
  load();
  return cache.posts.find((p) => p.slug === slug) || null;
}

async function getPostById(id) {
  load();
  return cache.posts.find((p) => p.id === id) || null;
}

async function createPost(p) {
  load();
  const now = new Date().toISOString();
  const post = {
    id: crypto.randomUUID(),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    coverImage: p.coverImage || '',
    content: p.content,
    category: p.category || '',
    authorId: p.authorId || null,
    authorName: p.authorName || '',
    status: p.status || 'draft',
    publishedAt: p.status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  cache.posts.push(post);
  persist();
  return post;
}

async function updatePost(id, patch) {
  load();
  const p = cache.posts.find((x) => x.id === id);
  if (!p) return null;
  if (patch.title !== undefined) p.title = patch.title;
  if (patch.excerpt !== undefined) p.excerpt = patch.excerpt;
  if (patch.coverImage !== undefined) p.coverImage = patch.coverImage;
  if (patch.content !== undefined) p.content = patch.content;
  if (patch.category !== undefined) p.category = patch.category;
  if (patch.status !== undefined) {
    p.status = patch.status;
    if (patch.status === 'published' && !p.publishedAt) p.publishedAt = new Date().toISOString();
  }
  p.updatedAt = new Date().toISOString();
  persist();
  return p;
}

async function deletePost(id) {
  load();
  const idx = cache.posts.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  cache.posts.splice(idx, 1);
  persist();
  return true;
}

// ---- Admins (allowlist) ----
async function listAdmins() {
  load();
  return cache.admins.map((a) => ({ email: a.email, addedBy: a.addedBy || '', createdAt: a.createdAt }));
}

async function hasAdmin(email) {
  load();
  return cache.admins.some((a) => a.email === email);
}

async function addAdmin(email, addedBy) {
  load();
  if (!cache.admins.some((a) => a.email === email)) {
    cache.admins.push({ email, addedBy: addedBy || '', createdAt: new Date().toISOString() });
    persist();
  }
  return { email, addedBy: addedBy || '' };
}

async function removeAdmin(email) {
  load();
  const idx = cache.admins.findIndex((a) => a.email === email);
  if (idx < 0) return false;
  cache.admins.splice(idx, 1);
  persist();
  return true;
}

// ---- Reviews ----
async function listReviewsForCard(cardId) {
  load();
  return cache.reviews
    .filter((r) => r.cardId === cardId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function upsertReview({ cardId, userId, userName, userPicture, userPlan, rating, title, body }) {
  load();
  const now = new Date().toISOString();
  const idx = cache.reviews.findIndex((r) => r.cardId === cardId && r.userId === userId);
  const review = {
    id: idx >= 0 ? cache.reviews[idx].id : crypto.randomUUID(),
    cardId, userId, userName: userName || '', userPicture: userPicture || '',
    userPlan: userPlan || 'free', rating, title: title || '', body: body || '',
    createdAt: idx >= 0 ? cache.reviews[idx].createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) cache.reviews[idx] = review;
  else cache.reviews.push(review);
  persist();
  return review;
}

async function removeReview(cardId, userId) {
  load();
  const idx = cache.reviews.findIndex((r) => r.cardId === cardId && r.userId === userId);
  if (idx < 0) return false;
  cache.reviews.splice(idx, 1);
  persist();
  return true;
}

// ---- Transactions ----
async function createTransaction({ userId, cardId, date, merchant, amount, category, source }) {
  load();
  const txn = {
    id: crypto.randomUUID(), userId, cardId: cardId || null,
    date, merchant: merchant || '', amount: Number(amount),
    category, source: source || 'manual', createdAt: new Date().toISOString(),
  };
  cache.transactions.push(txn);
  persist();
  return txn;
}

async function listTransactions(userId, { from, to } = {}) {
  load();
  return cache.transactions
    .filter((t) => {
      if (t.userId !== userId) return false;
      if (from && t.date < from) return false;
      if (to   && t.date > to)   return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

async function countTransactions(userId) {
  load();
  return cache.transactions.filter((t) => t.userId === userId).length;
}

async function deleteTransaction(id, userId) {
  load();
  const idx = cache.transactions.findIndex((t) => t.id === id && t.userId === userId);
  if (idx < 0) return false;
  cache.transactions.splice(idx, 1);
  persist();
  return true;
}

module.exports = {
  kind: 'json', init, upsertByGoogleId, findById, updatePlan, listCards, replaceCards,
  createPayment, findPendingPayments, markPaymentPaid,
  createSubscription, findPendingSubscriptions, markSubscriptionActive,
  listCatalog, countCatalog, upsertCard, deleteNotInCatalog,
  listPublishedPosts, listAllPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost,
  listAdmins, hasAdmin, addAdmin, removeAdmin,
  listReviewsForCard, upsertReview, removeReview,
  createTransaction, listTransactions, countTransactions, deleteTransaction,
};
