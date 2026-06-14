/*
 * Card Catalog routes.
 *
 *  GET  /catalog        -> { schemaVersion, lastUpdated, categories, cards[] }
 *     Extension ko card data deta hai. Public (no auth). 1hr cache header.
 *
 *  POST /catalog/seed   -> { seeded: N }
 *     Admin: bundled data/cards.json se Supabase populate karo.
 *     Pehli baar ya jab bhi naya cards.json update karo.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const express = require('express');
const db   = require('../db');

const router = express.Router();

// cards.json repo root mein hai (backend se 3 levels upar).
const SEED_FILE = path.join(__dirname, '..', '..', '..', 'data', 'cards.json');

function readSeedFile() {
  return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
}

// Sabhi active cards — sponsored pehle, phir alphabetically by id.
router.get('/', async (req, res) => {
  try {
    const cards = await db.catalog.list();
    const { categories } = readSeedFile(); // categories rarely change
    // no-cache: response stale na ho. Card updates turant propagate hone chahiye —
    // extension apni 24hr chrome.storage cache khud manage karta hai.
    res.set('Cache-Control', 'no-cache');
    res.json({
      schemaVersion: 2,
      lastUpdated: new Date().toISOString().split('T')[0],
      categories,
      cards,
    });
  } catch (err) {
    console.error('[catalog/get]', err.message);
    res.status(502).json({ error: 'Catalog fetch fail' });
  }
});

// Seed / refresh Supabase from bundled cards.json.
// Orphan entries (IDs not in cards.json) bhi delete ho jaate hain.
router.post('/seed', async (req, res) => {
  try {
    const { cards } = readSeedFile();
    for (const card of cards) await db.catalog.upsert(card);
    // Delete rows whose IDs are no longer in cards.json
    const deleted = await db.catalog.deleteNotIn(cards.map((c) => c.id));
    console.log(`[catalog/seed] ${cards.length} cards seeded, ${deleted} orphans removed`);
    res.json({ seeded: cards.length, deleted });
  } catch (err) {
    console.error('[catalog/seed]', err.message);
    res.status(502).json({ error: err.message });
  }
});

// Auto-seed helper — server.js startup pe call hota hai.
async function autoSeedIfEmpty() {
  try {
    const count = await db.catalog.count();
    if (count > 0) return;
    const { cards } = readSeedFile();
    for (const card of cards) await db.catalog.upsert(card);
    console.log(`[catalog] Auto-seeded ${cards.length} cards from cards.json`);
  } catch (err) {
    console.warn('[catalog] Auto-seed fail (cards.json missing?):', err.message);
  }
}

module.exports = router;
module.exports.autoSeedIfEmpty = autoSeedIfEmpty;
