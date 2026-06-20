/*
 * Public news/blog routes.
 *   GET /posts        -> { posts }   (published only)
 *   GET /posts/:slug  -> { post }    (published only, else 404)
 */
'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await db.posts.listPublished({ limit: 50 });
    res.json({ posts });
  } catch (err) {
    console.error('[posts/list]', err.message);
    res.status(502).json({ error: 'Posts fetch fail' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await db.posts.getBySlug(req.params.slug);
    if (!post || post.status !== 'published') return res.status(404).json({ error: 'Not found' });
    res.json({ post });
  } catch (err) {
    console.error('[posts/get]', err.message);
    res.status(502).json({ error: 'Post fetch fail' });
  }
});

module.exports = router;
