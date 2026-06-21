'use strict';

const db = require('../db');

/*
 * fireWatchlistNotifications(post)
 * Called when an offer post is published. Scans all watchlist keywords,
 * matches case-insensitively against title, sends one notification per user.
 */
async function fireWatchlistNotifications(post) {
  const entries = await db.watchlist.listAll();
  if (!entries.length) return;

  const haystack = `${post.title} ${post.content || ''}`.toLowerCase();
  const link = post.slug ? `/news/${post.slug}` : '/news';

  const matched = new Map(); // userId → first matched keyword
  for (const e of entries) {
    if (!matched.has(e.userId) && haystack.includes(e.keyword)) {
      matched.set(e.userId, e.keyword);
    }
  }

  for (const [userId, keyword] of matched) {
    try {
      await db.notifications.create(
        userId,
        `New offer: "${post.title}" — matches your watchword "${keyword}"`,
        link
      );
    } catch (err) {
      console.error('[watchlist notify]', err.message);
    }
  }
}

module.exports = { fireWatchlistNotifications };
