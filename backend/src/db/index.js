/*
 * DB driver selector. DATABASE_URL set hai to Postgres, warna JSON-file store.
 * Baaki app ko bas `db.users.*` interface dikhta hai — driver ka farak nahi padta.
 */
'use strict';

const { config } = require('../config');

let driver = null;

async function init() {
  if (config.databaseUrl) {
    driver = require('./pgStore');
    await driver.init(config.databaseUrl);
  } else {
    driver = require('./jsonStore');
    await driver.init();
  }
  console.log(`[db] driver: ${driver.kind}`);
  return driver;
}

// Common interface — dono drivers same shape dete hain.
const users = {
  upsertByGoogleId: (...a) => driver.upsertByGoogleId(...a),
  findById: (...a) => driver.findById(...a),
  updatePlan: (...a) => driver.updatePlan(...a),
};

const cards = {
  list: (...a) => driver.listCards(...a),
  replace: (...a) => driver.replaceCards(...a),
};

const payments = {
  create: (...a) => driver.createPayment(...a),
  findPending: (...a) => driver.findPendingPayments(...a),
  markPaid: (...a) => driver.markPaymentPaid(...a),
};

const subscriptions = {
  create: (...a) => driver.createSubscription(...a),
  findPending: (...a) => driver.findPendingSubscriptions(...a),
  markActive: (...a) => driver.markSubscriptionActive(...a),
};

const catalog = {
  list:        (...a) => driver.listCatalog(...a),
  count:       (...a) => driver.countCatalog(...a),
  upsert:      (...a) => driver.upsertCard(...a),
  deleteNotIn: (...a) => driver.deleteNotInCatalog(...a),
};

const posts = {
  listPublished: (...a) => driver.listPublishedPosts(...a),
  listAll:       (...a) => driver.listAllPosts(...a),
  getBySlug:     (...a) => driver.getPostBySlug(...a),
  getById:       (...a) => driver.getPostById(...a),
  create:        (...a) => driver.createPost(...a),
  update:        (...a) => driver.updatePost(...a),
  remove:        (...a) => driver.deletePost(...a),
};

const admins = {
  list:   (...a) => driver.listAdmins(...a),
  has:    (...a) => driver.hasAdmin(...a),
  add:    (...a) => driver.addAdmin(...a),
  remove: (...a) => driver.removeAdmin(...a),
};

const reviews = {
  listForCard: (...a) => driver.listReviewsForCard(...a),
  upsert:      (...a) => driver.upsertReview(...a),
  remove:      (...a) => driver.removeReview(...a),
};

module.exports = { init, users, cards, payments, subscriptions, catalog, posts, admins, reviews, get kind() { return driver && driver.kind; } };
