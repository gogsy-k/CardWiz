/*
 * PostgreSQL user store — production driver (DATABASE_URL set ho to).
 * Supabase ka connection string yahan kaam karta hai.
 * 'pg' optionalDependency hai — sirf yahi driver use ho to install zaroori.
 *
 * Schema: backend/schema.sql (init pe khud bhi ensure kar leta hai).
 */
'use strict';

let pool = null;

async function init(databaseUrl) {
  // Lazy require — JSON path pe 'pg' install na ho to bhi backend chale.
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: databaseUrl,
    // Supabase / managed PG ko aksar SSL chahiye.
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  // Table na ho to bana do (idempotent) — schema.sql ka core.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id   TEXT UNIQUE NOT NULL,
      email       TEXT NOT NULL,
      name        TEXT,
      picture     TEXT,
      plan        TEXT NOT NULL DEFAULT 'free',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Cards table — synced wallet entries. NOTE: sirf last4, NEVER full PAN/CVV.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cards (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id     TEXT NOT NULL,
      card_id       TEXT NOT NULL,
      nickname      TEXT,
      last4         TEXT,
      due_day       INT,
      reminder_days_before INT,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, client_id)
    );
  `);

  // Payments — premium upgrade records (Razorpay). Koi card data nahi.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rzp_link_id    TEXT,
      rzp_payment_id TEXT,
      amount         INT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'created',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Subscriptions — recurring billing (monthly/yearly + free trial).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rzp_sub_id  TEXT NOT NULL,
      plan        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'created',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Card catalog — centralized, backend se update hota hai (no extension redeploy).
  // sponsored=true cards pehle dikhte hain (promoted placement).
  // card_variant = 'credit' | 'debit'  (Supabase dashboard mein filter kar sakte ho)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS card_catalog (
      id                   TEXT PRIMARY KEY,
      name                 TEXT NOT NULL,
      bank                 TEXT NOT NULL,
      network              TEXT,
      card_variant         TEXT DEFAULT 'credit',
      card_type            TEXT DEFAULT 'cashback',
      point_value_inr      NUMERIC DEFAULT 1,
      annual_fee           INT DEFAULT 0,
      fee_waiver_spend     INT DEFAULT 0,
      base_rate            NUMERIC DEFAULT 1,
      base_monthly_cap     INT,
      rules                JSONB DEFAULT '[]',
      exclusions           JSONB DEFAULT '[]',
      fuel_surcharge_waiver BOOLEAN DEFAULT false,
      sponsored            BOOLEAN DEFAULT false,
      sponsored_order      INT DEFAULT 999,
      referral_url         TEXT,
      active               BOOLEAN DEFAULT true,
      last_verified        DATE,
      updated_at           TIMESTAMPTZ DEFAULT now()
    );
  `);
  // Existing tables ke liye migration — naya column safely add karo.
  await pool.query(`
    ALTER TABLE card_catalog ADD COLUMN IF NOT EXISTS card_variant TEXT DEFAULT 'credit';
  `);
}

// DB row -> humara user shape (camelCase, consistent JSON store ke saath).
function rowToUser(r) {
  if (!r) return null;
  return {
    id: r.id,
    googleId: r.google_id,
    email: r.email,
    name: r.name,
    picture: r.picture,
    plan: r.plan,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function upsertByGoogleId({ googleId, email, name, picture }) {
  const res = await pool.query(
    `INSERT INTO users (google_id, email, name, picture)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email,
           name = EXCLUDED.name,
           picture = EXCLUDED.picture,
           updated_at = now()
     RETURNING *`,
    [googleId, email, name, picture]
  );
  return rowToUser(res.rows[0]);
}

async function findById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rowToUser(res.rows[0]);
}

async function updatePlan(id, plan) {
  const res = await pool.query(
    'UPDATE users SET plan = $2, updated_at = now() WHERE id = $1 RETURNING *',
    [id, plan]
  );
  return rowToUser(res.rows[0]);
}

// ---- Cards (synced wallet) ----
function rowToCard(r) {
  return {
    id: r.client_id,
    cardId: r.card_id,
    nickname: r.nickname || '',
    last4: r.last4 || '',
    dueDay: r.due_day,
    reminderDaysBefore: r.reminder_days_before,
    updatedAt: r.updated_at,
  };
}

async function listCards(userId) {
  const res = await pool.query(
    'SELECT * FROM cards WHERE user_id = $1 ORDER BY updated_at', [userId]);
  return res.rows.map(rowToCard);
}

// Full-set replace (transaction): user ke saare cards is set se replace kar do.
async function replaceCards(userId, cards) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cards WHERE user_id = $1', [userId]);
    for (const c of cards) {
      await client.query(
        `INSERT INTO cards (user_id, client_id, card_id, nickname, last4, due_day, reminder_days_before, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8::timestamptz, now()))`,
        [userId, c.id, c.cardId, c.nickname || null, c.last4 || null,
         c.dueDay ?? null, c.reminderDaysBefore ?? null, c.updatedAt || null]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return listCards(userId);
}

// ---- Payments (premium upgrade) ----
function rowToPayment(r) {
  if (!r) return null;
  return {
    id: r.id, userId: r.user_id, linkId: r.rzp_link_id, paymentId: r.rzp_payment_id,
    amount: r.amount, status: r.status, createdAt: r.created_at,
  };
}

async function createPayment(userId, linkId, amount) {
  const res = await pool.query(
    'INSERT INTO payments (user_id, rzp_link_id, amount) VALUES ($1,$2,$3) RETURNING *',
    [userId, linkId, amount]);
  return rowToPayment(res.rows[0]);
}

async function findPendingPayments(userId, limit = 5) {
  const res = await pool.query(
    "SELECT * FROM payments WHERE user_id=$1 AND status='created' ORDER BY created_at DESC LIMIT $2",
    [userId, limit]);
  return res.rows.map(rowToPayment);
}

async function markPaymentPaid(id, paymentId) {
  const res = await pool.query(
    "UPDATE payments SET status='paid', rzp_payment_id=$2, updated_at=now() WHERE id=$1 RETURNING *",
    [id, paymentId]);
  return rowToPayment(res.rows[0]);
}

// ---- Subscriptions (recurring + trial) ----
async function createSubscription(userId, subId, plan) {
  const res = await pool.query(
    'INSERT INTO subscriptions (user_id, rzp_sub_id, plan) VALUES ($1,$2,$3) RETURNING *',
    [userId, subId, plan]);
  const r = res.rows[0];
  return { id: r.id, userId: r.user_id, subId: r.rzp_sub_id, plan: r.plan, status: r.status, createdAt: r.created_at };
}

async function findPendingSubscriptions(userId, limit = 5) {
  const res = await pool.query(
    "SELECT * FROM subscriptions WHERE user_id=$1 AND status='created' ORDER BY created_at DESC LIMIT $2",
    [userId, limit]);
  return res.rows.map((r) => ({ id: r.id, userId: r.user_id, subId: r.rzp_sub_id, plan: r.plan, status: r.status, createdAt: r.created_at }));
}

async function markSubscriptionActive(subId) {
  const res = await pool.query(
    "UPDATE subscriptions SET status='active', updated_at=now() WHERE rzp_sub_id=$1 RETURNING *",
    [subId]);
  const r = res.rows[0];
  return r ? { id: r.id, subId: r.rzp_sub_id, status: r.status } : null;
}

// ---- Card Catalog ----
function rowToCatalogCard(r) {
  return {
    id: r.id,
    name: r.name,
    bank: r.bank,
    network: r.network || '',
    cardType: r.card_variant || 'credit',   // 'credit' | 'debit'
    type: r.card_type || 'cashback',        // 'cashback' | 'points' | 'miles'
    pointValueINR: parseFloat(r.point_value_inr) || 1,
    annualFee: r.annual_fee || 0,
    feeWaiverSpend: r.fee_waiver_spend || 0,
    baseRate: parseFloat(r.base_rate) || 1,
    baseMonthlyCapValue: r.base_monthly_cap || null,
    rules: r.rules || [],
    exclusions: r.exclusions || [],
    fuelSurchargeWaiver: r.fuel_surcharge_waiver || false,
    sponsored: r.sponsored || false,
    sponsoredOrder: r.sponsored_order || 999,
    referralUrl: r.referral_url || null,
    lastVerified: r.last_verified ? r.last_verified.toISOString().split('T')[0] : null,
  };
}

async function deleteNotInCatalog(ids) {
  if (!ids || ids.length === 0) return 0;
  const res = await pool.query(
    `DELETE FROM card_catalog WHERE id != ALL($1::text[]) RETURNING id`,
    [ids]
  );
  return res.rowCount;
}

async function listCatalog() {
  const res = await pool.query(
    'SELECT * FROM card_catalog WHERE active = true ORDER BY sponsored DESC, sponsored_order ASC, id ASC'
  );
  return res.rows.map(rowToCatalogCard);
}

async function countCatalog() {
  const res = await pool.query('SELECT COUNT(*) FROM card_catalog');
  return parseInt(res.rows[0].count, 10);
}

async function upsertCard(card) {
  await pool.query(`
    INSERT INTO card_catalog
      (id, name, bank, network, card_variant, card_type, point_value_inr, annual_fee,
       fee_waiver_spend, base_rate, base_monthly_cap, rules, exclusions,
       fuel_surcharge_waiver, last_verified, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now())
    ON CONFLICT (id) DO UPDATE SET
      name=$2, bank=$3, network=$4, card_variant=$5, card_type=$6, point_value_inr=$7,
      annual_fee=$8, fee_waiver_spend=$9, base_rate=$10, base_monthly_cap=$11,
      rules=$12, exclusions=$13, fuel_surcharge_waiver=$14, last_verified=$15,
      updated_at=now()
  `, [
    card.id, card.name, card.bank,
    card.network || null,
    card.cardType || 'credit',
    card.type || 'cashback',
    card.pointValueINR || 1,
    card.annualFee || 0,
    card.feeWaiverSpend || 0,
    card.baseRate || 1,
    card.baseMonthlyCapValue || null,
    JSON.stringify(card.rules || []),
    JSON.stringify(card.exclusions || []),
    card.fuelSurchargeWaiver || false,
    card.lastVerified || null,
  ]);
}

module.exports = {
  kind: 'postgres', init, upsertByGoogleId, findById, updatePlan, listCards, replaceCards,
  createPayment, findPendingPayments, markPaymentPaid,
  createSubscription, findPendingSubscriptions, markSubscriptionActive,
  listCatalog, countCatalog, upsertCard, deleteNotInCatalog,
};
