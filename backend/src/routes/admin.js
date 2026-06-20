/*
 * Admin routes (all gated).
 *   requireAdmin:       post CRUD (create/edit/publish/delete news).
 *   requireSuperAdmin:  manage the admin allowlist (add/remove admin emails).
 * Admin status is computed (services/admin.js); writes are server-enforced here.
 */
'use strict';

const express = require('express');
const db = require('../db');
const { config } = require('../config');
const { requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { norm } = require('../services/admin');

const router = express.Router();

// title -> ascii slug; non-latin (Devanagari/Gurmukhi) strips to empty -> timestamp fallback.
function slugify(title) {
  const ascii = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii || `post-${Date.now().toString(36)}`;
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.posts.getBySlug(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

const cap = (s, n) => (typeof s === 'string' ? s.slice(0, n) : s);

function cleanPostInput(body) {
  return {
    title: cap((body.title || '').trim(), 200),
    excerpt: cap((body.excerpt || '').trim(), 500),
    coverImage: cap((body.coverImage || '').trim(), 1000),
    content: typeof body.content === 'string' ? body.content : '',
    category: cap((body.category || '').trim(), 60),
    status: body.status === 'published' ? 'published' : 'draft',
  };
}

// ---------- Posts ----------
router.get('/posts', requireAdmin, async (req, res) => {
  const posts = await db.posts.listAll();
  res.json({ posts });
});

router.get('/posts/:id', requireAdmin, async (req, res) => {
  const post = await db.posts.getById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json({ post });
});

router.post('/posts', requireAdmin, async (req, res) => {
  const data = cleanPostInput(req.body || {});
  if (!data.title || !data.content) return res.status(400).json({ error: 'title and content required' });
  const slug = await uniqueSlug(slugify(req.body.slug || data.title));
  const post = await db.posts.create({
    ...data,
    slug,
    authorId: req.user.id,
    authorName: req.user.name || '',
  });
  res.json({ post });
});

router.put('/posts/:id', requireAdmin, async (req, res) => {
  const existing = await db.posts.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const data = cleanPostInput(req.body || {});
  if (!data.title || !data.content) return res.status(400).json({ error: 'title and content required' });
  // slug stays stable after creation (preserve URLs)
  const post = await db.posts.update(req.params.id, data);
  res.json({ post });
});

router.delete('/posts/:id', requireAdmin, async (req, res) => {
  const ok = await db.posts.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- Admin allowlist (super-admin only) ----------
router.get('/admins', requireSuperAdmin, async (req, res) => {
  const admins = await db.admins.list();
  res.json({ superAdmins: config.superAdminEmails, admins });
});

router.post('/admins', requireSuperAdmin, async (req, res) => {
  const email = norm(req.body && req.body.email);
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
  if (config.superAdminEmails.includes(email)) return res.status(400).json({ error: 'Already a super-admin' });
  await db.admins.add(email, req.user.email);
  res.json({ ok: true, email });
});

router.delete('/admins/:email', requireSuperAdmin, async (req, res) => {
  const email = norm(req.params.email);
  if (config.superAdminEmails.includes(email)) return res.status(400).json({ error: 'Cannot remove a super-admin' });
  const ok = await db.admins.remove(email);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
