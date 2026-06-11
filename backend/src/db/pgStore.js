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

module.exports = { kind: 'postgres', init, upsertByGoogleId, findById, updatePlan };
