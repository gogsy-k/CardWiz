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

async function findLatestPendingPayment(userId) {
  const res = await pool.query(
    "SELECT * FROM payments WHERE user_id=$1 AND status='created' ORDER BY created_at DESC LIMIT 1",
    [userId]);
  return rowToPayment(res.rows[0]);
}

async function markPaymentPaid(id, paymentId) {
  const res = await pool.query(
    "UPDATE payments SET status='paid', rzp_payment_id=$2, updated_at=now() WHERE id=$1 RETURNING *",
    [id, paymentId]);
  return rowToPayment(res.rows[0]);
}

module.exports = {
  kind: 'postgres', init, upsertByGoogleId, findById, updatePlan, listCards, replaceCards,
  createPayment, findLatestPendingPayment, markPaymentPaid,
};
