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

module.exports = { init, users, cards, get kind() { return driver && driver.kind; } };
