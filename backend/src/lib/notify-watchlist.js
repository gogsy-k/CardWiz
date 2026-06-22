'use strict';

const db = require('../db');
const { sendOfferAlert } = require('./email');

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
    // In-app notification (extension polls these).
    try {
      await db.notifications.create(
        userId,
        `New offer: "${post.title}" — matches your watchword "${keyword}"`,
        link
      );
    } catch (err) {
      console.error('[watchlist notify]', err.message);
    }

    // Email alert (best-effort — Resend no-ops if key missing).
    try {
      const user = await db.users.findById(userId);
      if (user && user.email) {
        await sendOfferAlert({ to: user.email, name: user.name, post, keyword });
      }
    } catch (err) {
      console.error('[watchlist email]', err.message);
    }
  }
}

module.exports = { fireWatchlistNotifications };
