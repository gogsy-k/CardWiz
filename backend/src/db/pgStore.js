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
      email_reports BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_reports BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_until TIMESTAMPTZ;
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

  // News/blog posts — admin-authored. content = markdown.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug          TEXT UNIQUE NOT NULL,
      title         TEXT NOT NULL,
      excerpt       TEXT,
      cover_image   TEXT,
      content       TEXT NOT NULL,
      category      TEXT,
      author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
      author_name   TEXT,
      status        TEXT NOT NULL DEFAULT 'draft',
      lang          TEXT NOT NULL DEFAULT 'hinglish',
      translation_group TEXT,
      published_at  TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Migrations for existing deployments (idempotent).
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'hinglish';`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS translation_group TEXT;`);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS posts_status_published_idx ON posts (status, published_at DESC);
    CREATE INDEX IF NOT EXISTS posts_translation_group_idx ON posts (translation_group);
  `);

  // Admin allowlist — emails jinke paas admin access hai (super-admins config mein alag).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      email       TEXT PRIMARY KEY,
      added_by    TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Card reviews — 1 per (card, user). User authenticates to write; reading is public.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      card_id      TEXT NOT NULL,
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name    TEXT,
      user_picture TEXT,
      user_plan    TEXT NOT NULL DEFAULT 'free',
      rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title        TEXT,
      body         TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (card_id, user_id)
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS reviews_card_idx ON reviews (card_id, created_at DESC);
  `);

  // CardWiz Rewards — points ledger. Balance = SUM(delta). Each (user, reason, ref_id)
  // awards once (idempotent) so the same review/txn/offer can't double-credit.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS points_ledger (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      delta       INTEGER NOT NULL,
      reason      TEXT NOT NULL,
      ref_id      TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS points_dedupe ON points_ledger (user_id, reason, ref_id) WHERE ref_id IS NOT NULL;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS points_user_idx ON points_ledger (user_id, created_at DESC);
  `);

  // Manual transactions — spend log for Missed Savings engine.
  // source = 'manual' | 'pdf'. card_id = catalog card id (e.g. 'hdfc-millennia').
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      card_id    TEXT,
      date       DATE NOT NULL,
      merchant   TEXT,
      amount     NUMERIC(12,2) NOT NULL,
      category   TEXT NOT NULL,
      source     TEXT NOT NULL DEFAULT 'manual',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS txn_user_date_idx ON transactions (user_id, date DESC);
  `);

  // User-submitted bank offers — moderated by admin before going live.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant         TEXT NOT NULL,
      bank             TEXT,
      card_id          TEXT,
      title            TEXT NOT NULL,
      discount_text    TEXT NOT NULL,
      valid_until      DATE,
      submitted_by     UUID REFERENCES users(id) ON DELETE SET NULL,
      submitted_by_email TEXT,
      status           TEXT NOT NULL DEFAULT 'pending',
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS offers_status_idx  ON offers (status, created_at DESC);
    CREATE INDEX IF NOT EXISTS offers_bank_idx    ON offers (bank, status);
    CREATE INDEX IF NOT EXISTS offers_card_idx    ON offers (card_id, status);
  `);

  // Offer watchlist — keywords a user wants to be notified about.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      keyword    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, keyword)
    );
    CREATE INDEX IF NOT EXISTS watchlist_user_idx ON watchlist (user_id);
  `);

  // In-app notifications — created when a watched keyword matches a published offer post.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message    TEXT NOT NULL,
      link       TEXT,
      read       BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS notifs_user_idx ON notifications (user_id, read, created_at DESC);
  `);

  // Launch waitlist — emails captured by the "notify me at launch" CTA (extension not live yet).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS launch_subscribers (
      email      TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// DB row -> humara user shape (camelCase, consistent JSON store ke saath).
function rowToUser(r) {
  if (!r) return null;
  // Points-granted Premium has plan_until set and expires; subscription/free keep
  // plan_until = NULL (no expiry). Effective plan downgrades to free once expired.
  const planUntil = r.plan_until || null;
  const expired = planUntil && new Date(planUntil) < new Date();
  return {
    id: r.id,
    googleId: r.google_id,
    email: r.email,
    name: r.name,
    picture: r.picture,
    plan: expired ? 'free' : r.plan,
    planUntil: expired ? null : planUntil,
    referralCode: r.id ? r.id.replace(/-/g, '').slice(0, 8).toUpperCase() : null,
    emailReports: !!r.email_reports,
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
     RETURNING *, (xmax = 0) AS is_new`,
    [googleId, email, name, picture]
  );
  const user = rowToUser(res.rows[0]);
  user.isNew = res.rows[0].is_new === true; // xmax=0 => freshly INSERTed (not an UPDATE)
  return user;
}

// Look up a user by their (computed) 8-char referral code.
async function findByReferralCode(code) {
  if (!code) return null;
  const res = await pool.query(
    `SELECT * FROM users WHERE substr(upper(replace(id::text, '-', '')), 1, 8) = $1 LIMIT 1`,
    [String(code).toUpperCase()]
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

// Grant N days of a plan via points redemption. Stacks: extends from the later of the
// current expiry or now. plan_until set => this grant expires (unlike subscriptions).
async function redeemPlanDays(id, plan, days) {
  const res = await pool.query(
    `UPDATE users
        SET plan = $2,
            plan_until = GREATEST(COALESCE(plan_until, now()), now()) + ($3 || ' days')::interval,
            updated_at = now()
      WHERE id = $1 RETURNING *`,
    [id, plan, String(Number(days))]
  );
  return rowToUser(res.rows[0]);
}

async function updateEmailPrefs(id, enabled) {
  const res = await pool.query(
    'UPDATE users SET email_reports = $2, updated_at = now() WHERE id = $1 RETURNING *',
    [id, !!enabled]
  );
  return rowToUser(res.rows[0]);
}

async function listPremiumEmailUsers() {
  const res = await pool.query(
    "SELECT * FROM users WHERE plan IN ('premium', 'pro') AND email_reports = true"
  );
  return res.rows.map(rowToUser);
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

// ---- Posts (news/blog) ----
function rowToPost(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt || '',
    coverImage: r.cover_image || '',
    content: r.content,
    category: r.category || '',
    authorId: r.author_id,
    authorName: r.author_name || '',
    status: r.status,
    lang: r.lang || 'hinglish',
    translationGroup: r.translation_group || null,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Published sibling translations (same group, different slug) — for hreflang + switcher.
async function listTranslations(translationGroup, excludeSlug) {
  if (!translationGroup) return [];
  const res = await pool.query(
    "SELECT slug, title, lang FROM posts WHERE translation_group=$1 AND status='published' AND (published_at IS NULL OR published_at <= now()) AND slug<>$2 ORDER BY lang",
    [translationGroup, excludeSlug || '']
  );
  return res.rows.map((r) => ({ slug: r.slug, title: r.title, lang: r.lang }));
}

async function listPublishedPosts({ limit = 50, offset = 0 } = {}) {
  const res = await pool.query(
    "SELECT * FROM posts WHERE status='published' AND (published_at IS NULL OR published_at <= now()) ORDER BY published_at DESC NULLS LAST LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return res.rows.map(rowToPost);
}

async function listAllPosts() {
  const res = await pool.query('SELECT * FROM posts ORDER BY updated_at DESC');
  return res.rows.map(rowToPost);
}

async function getPostBySlug(slug) {
  const res = await pool.query('SELECT * FROM posts WHERE slug = $1', [slug]);
  return rowToPost(res.rows[0]);
}

async function getPostById(id) {
  const res = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  return rowToPost(res.rows[0]);
}

async function createPost(p) {
  const publishedAt = p.publishedAt || (p.status === 'published' ? new Date().toISOString() : null);
  const res = await pool.query(
    `INSERT INTO posts (slug, title, excerpt, cover_image, content, category, author_id, author_name, status, lang, translation_group, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [p.slug, p.title, p.excerpt || null, p.coverImage || null, p.content, p.category || null,
     p.authorId || null, p.authorName || null, p.status || 'draft',
     p.lang || 'hinglish', p.translationGroup || null, publishedAt]
  );
  return rowToPost(res.rows[0]);
}

async function updatePost(id, patch) {
  const cur = await getPostById(id);
  if (!cur) return null;
  // First-publish pe hi published_at set karo (re-publish pe original date rakho).
  let publishedAt = patch.publishedAt || cur.publishedAt;
  if (patch.status === 'published' && !publishedAt) publishedAt = new Date().toISOString();
  const res = await pool.query(
    `UPDATE posts SET
       title=$2, excerpt=$3, cover_image=$4, content=$5, category=$6, status=$7,
       lang=$9, translation_group=$10, published_at=$8, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [
      id,
      patch.title ?? cur.title,
      patch.excerpt ?? cur.excerpt,
      patch.coverImage ?? cur.coverImage,
      patch.content ?? cur.content,
      patch.category ?? cur.category,
      patch.status ?? cur.status,
      publishedAt,
      patch.lang ?? cur.lang,
      patch.translationGroup ?? cur.translationGroup,
    ]
  );
  return rowToPost(res.rows[0]);
}

async function deletePost(id) {
  const res = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
  return res.rowCount > 0;
}

// ---- Admins (allowlist) ----
async function listAdmins() {
  const res = await pool.query('SELECT email, added_by, created_at FROM admins ORDER BY created_at');
  return res.rows.map((r) => ({ email: r.email, addedBy: r.added_by || '', createdAt: r.created_at }));
}

async function hasAdmin(email) {
  const res = await pool.query('SELECT 1 FROM admins WHERE email = $1', [email]);
  return res.rowCount > 0;
}

async function addAdmin(email, addedBy) {
  await pool.query(
    'INSERT INTO admins (email, added_by) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING',
    [email, addedBy || null]
  );
  return { email, addedBy: addedBy || '' };
}

async function removeAdmin(email) {
  const res = await pool.query('DELETE FROM admins WHERE email = $1 RETURNING email', [email]);
  return res.rowCount > 0;
}

// ---- Reviews ----
function rowToReview(r) {
  if (!r) return null;
  return {
    id: r.id, cardId: r.card_id, userId: r.user_id,
    userName: r.user_name || '', userPicture: r.user_picture || '',
    userPlan: r.user_plan || 'free',
    rating: r.rating, title: r.title || '', body: r.body || '',
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

async function listReviewsForCard(cardId) {
  const res = await pool.query(
    'SELECT * FROM reviews WHERE card_id = $1 ORDER BY created_at DESC',
    [cardId]
  );
  return res.rows.map(rowToReview);
}

// Recent reviews across all cards (for pricing-page social proof).
async function listRecentReviews(limit = 6) {
  const res = await pool.query(
    'SELECT * FROM reviews ORDER BY created_at DESC LIMIT $1',
    [Math.min(Number(limit) || 6, 20)]
  );
  return res.rows.map(rowToReview);
}

async function upsertReview({ cardId, userId, userName, userPicture, userPlan, rating, title, body }) {
  const res = await pool.query(
    `INSERT INTO reviews (card_id, user_id, user_name, user_picture, user_plan, rating, title, body)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (card_id, user_id) DO UPDATE SET
       rating=$6, title=$7, body=$8, user_plan=$5, updated_at=now()
     RETURNING *`,
    [cardId, userId, userName || null, userPicture || null, userPlan || 'free', rating, title || null, body || null]
  );
  return rowToReview(res.rows[0]);
}

async function removeReview(cardId, userId) {
  const res = await pool.query(
    'DELETE FROM reviews WHERE card_id=$1 AND user_id=$2 RETURNING id',
    [cardId, userId]
  );
  return res.rowCount > 0;
}

// ---- Rewards (points ledger) ----
async function awardPoints(userId, { delta, reason, refId = null }) {
  // ON CONFLICT DO NOTHING → idempotent per (user, reason, ref_id) via the partial index.
  const res = await pool.query(
    `INSERT INTO points_ledger (user_id, delta, reason, ref_id) VALUES ($1,$2,$3,$4)
     ON CONFLICT DO NOTHING RETURNING id`,
    [userId, delta, reason, refId]
  );
  return res.rowCount > 0; // true = awarded, false = already credited
}

async function pointsBalance(userId) {
  const res = await pool.query('SELECT COALESCE(SUM(delta),0)::int AS bal FROM points_ledger WHERE user_id=$1', [userId]);
  return res.rows[0].bal;
}

async function pointsHistory(userId, limit = 30) {
  const res = await pool.query(
    'SELECT delta, reason, ref_id, created_at FROM points_ledger WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2',
    [userId, Math.min(Number(limit) || 30, 100)]
  );
  return res.rows.map((r) => ({ delta: r.delta, reason: r.reason, refId: r.ref_id, createdAt: r.created_at }));
}

// Distinct check-in dates (ref_id = 'YYYY-MM-DD') for streak computation.
async function pointsCheckinDates(userId) {
  const res = await pool.query(
    "SELECT ref_id FROM points_ledger WHERE user_id=$1 AND reason='checkin' ORDER BY ref_id DESC LIMIT 90",
    [userId]
  );
  return res.rows.map((r) => r.ref_id);
}

// Top earners — ranked by lifetime EARNED points (redeems don't lower your rank).
async function pointsLeaderboard(limit = 10) {
  const res = await pool.query(
    `SELECT u.id, u.name, u.picture, u.plan,
            COALESCE(SUM(p.delta) FILTER (WHERE p.delta > 0), 0)::int AS earned
       FROM points_ledger p JOIN users u ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY earned DESC, u.created_at ASC
      LIMIT $1`,
    [Math.min(Number(limit) || 10, 50)]
  );
  return res.rows.map((r) => ({
    id: r.id,
    name: (r.name || 'CardWiz user').split(' ')[0],
    picture: r.picture,
    plan: r.plan,
    earned: r.earned,
  }));
}

async function pointsRank(userId) {
  const res = await pool.query(
    `WITH earned AS (
       SELECT user_id, SUM(delta) FILTER (WHERE delta > 0) AS e FROM points_ledger GROUP BY user_id
     )
     SELECT COALESCE((SELECT e FROM earned WHERE user_id = $1), 0)::int AS earned,
            ((SELECT COUNT(*) FROM earned WHERE e > COALESCE((SELECT e FROM earned WHERE user_id = $1), 0)) + 1)::int AS rank`,
    [userId]
  );
  return { rank: res.rows[0].rank, earned: res.rows[0].earned };
}

// ---- Transactions ----
function rowToTxn(r) {
  return {
    id: r.id, userId: r.user_id, cardId: r.card_id || null,
    date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
    merchant: r.merchant || '', amount: Number(r.amount),
    category: r.category, source: r.source || 'manual', createdAt: r.created_at,
  };
}

async function createTransaction({ userId, cardId, date, merchant, amount, category, source }) {
  const res = await pool.query(
    `INSERT INTO transactions (user_id, card_id, date, merchant, amount, category, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [userId, cardId || null, date, merchant || null, amount, category, source || 'manual']
  );
  return rowToTxn(res.rows[0]);
}

async function listTransactions(userId, { from, to } = {}) {
  const params = [userId];
  let where = 'WHERE user_id = $1';
  if (from) { params.push(from); where += ` AND date >= $${params.length}`; }
  if (to)   { params.push(to);   where += ` AND date <= $${params.length}`; }
  const res = await pool.query(
    `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC`,
    params
  );
  return res.rows.map(rowToTxn);
}

async function countTransactions(userId) {
  const res = await pool.query('SELECT COUNT(*) FROM transactions WHERE user_id=$1', [userId]);
  return Number(res.rows[0].count);
}

async function deleteTransaction(id, userId) {
  const res = await pool.query(
    'DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING id',
    [id, userId]
  );
  return res.rowCount > 0;
}

// ---- Offers ----
function rowToOffer(r) {
  if (!r) return null;
  return {
    id: r.id,
    merchant: r.merchant,
    bank: r.bank || null,
    cardId: r.card_id || null,
    title: r.title,
    discountText: r.discount_text,
    validUntil: r.valid_until ? r.valid_until.toISOString().slice(0, 10) : null,
    submittedBy: r.submitted_by || null,
    submittedByEmail: r.submitted_by_email || null,
    status: r.status,
    createdAt: r.created_at,
  };
}

async function createOffer({ merchant, bank, cardId, title, discountText, validUntil, submittedBy, submittedByEmail }) {
  const res = await pool.query(
    `INSERT INTO offers (merchant, bank, card_id, title, discount_text, valid_until, submitted_by, submitted_by_email)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [merchant, bank || null, cardId || null, title, discountText, validUntil || null, submittedBy || null, submittedByEmail || null]
  );
  return rowToOffer(res.rows[0]);
}

async function listOffers({ status = 'approved', bank, cardId, limit = 50 } = {}) {
  const conds = ['status = $1'];
  const vals  = [status];
  if (bank)   { vals.push(bank);   conds.push(`bank = $${vals.length}`); }
  if (cardId) { vals.push(cardId); conds.push(`card_id = $${vals.length}`); }
  vals.push(limit);
  const res = await pool.query(
    `SELECT * FROM offers WHERE ${conds.join(' AND ')} ORDER BY created_at DESC LIMIT $${vals.length}`,
    vals
  );
  return res.rows.map(rowToOffer);
}

async function updateOfferStatus(id, status) {
  const res = await pool.query(
    'UPDATE offers SET status=$2, updated_at=now() WHERE id=$1 RETURNING *',
    [id, status]
  );
  return rowToOffer(res.rows[0]);
}

async function countOffersByUser(userId, sinceMs) {
  const since = new Date(sinceMs).toISOString();
  const res = await pool.query(
    'SELECT COUNT(*) FROM offers WHERE submitted_by=$1 AND created_at > $2',
    [userId, since]
  );
  return Number(res.rows[0].count);
}

// ---- Watchlist ----
async function addWatchword(userId, keyword) {
  await pool.query(
    'INSERT INTO watchlist (user_id, keyword) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [userId, keyword.toLowerCase()]
  );
}

async function removeWatchword(userId, keyword) {
  await pool.query('DELETE FROM watchlist WHERE user_id=$1 AND keyword=$2', [userId, keyword.toLowerCase()]);
}

async function listWatchwords(userId) {
  const res = await pool.query('SELECT keyword FROM watchlist WHERE user_id=$1 ORDER BY created_at', [userId]);
  return res.rows.map((r) => r.keyword);
}

async function countWatchwords(userId) {
  const res = await pool.query('SELECT COUNT(*) FROM watchlist WHERE user_id=$1', [userId]);
  return Number(res.rows[0].count);
}

async function listAllWatchwords() {
  const res = await pool.query('SELECT user_id AS "userId", keyword FROM watchlist');
  return res.rows;
}

// ---- Notifications ----
function rowToNotif(r) {
  return { id: r.id, userId: r.user_id, message: r.message, link: r.link || null, read: !!r.read, createdAt: r.created_at };
}

async function createNotification(userId, message, link) {
  const res = await pool.query(
    'INSERT INTO notifications (user_id, message, link) VALUES ($1,$2,$3) RETURNING *',
    [userId, message, link || null]
  );
  return rowToNotif(res.rows[0]);
}

async function listNotifications(userId, limit = 20) {
  const res = await pool.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY read ASC, created_at DESC LIMIT $2',
    [userId, limit]
  );
  return res.rows.map(rowToNotif);
}

async function markAllNotificationsRead(userId) {
  await pool.query('UPDATE notifications SET read=true WHERE user_id=$1 AND read=false', [userId]);
}

// ---- Launch waitlist ----
async function addLaunchSubscriber(email) {
  const res = await pool.query(
    'INSERT INTO launch_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING email',
    [email.toLowerCase()]
  );
  return res.rowCount > 0; // true = newly added, false = already subscribed
}

async function countLaunchSubscribers() {
  const res = await pool.query('SELECT COUNT(*) FROM launch_subscribers');
  return Number(res.rows[0].count);
}

module.exports = {
  kind: 'postgres', init, upsertByGoogleId, findById, findByReferralCode, updatePlan, redeemPlanDays, updateEmailPrefs, listPremiumEmailUsers, listCards, replaceCards,
  createPayment, findPendingPayments, markPaymentPaid,
  createSubscription, findPendingSubscriptions, markSubscriptionActive,
  listCatalog, countCatalog, upsertCard, deleteNotInCatalog,
  listPublishedPosts, listAllPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost, listTranslations,
  listAdmins, hasAdmin, addAdmin, removeAdmin,
  listReviewsForCard, listRecentReviews, upsertReview, removeReview,
  awardPoints, pointsBalance, pointsHistory, pointsCheckinDates, pointsLeaderboard, pointsRank,
  createTransaction, listTransactions, countTransactions, deleteTransaction,
  createOffer, listOffers, updateOfferStatus, countOffersByUser,
  addWatchword, removeWatchword, listWatchwords, countWatchwords, listAllWatchwords,
  createNotification, listNotifications, markAllNotificationsRead,
  addLaunchSubscriber, countLaunchSubscribers,
};
