/*
 * CardWiz backend — entry point (Phase 8).
 * Express server: Google SSO + user accounts. Card numbers / CVV kabhi nahi.
 *
 * Run: npm start   (ya npm run dev for auto-reload)
 */
'use strict';

const express = require('express');
const cors = require('cors');

const { config, validate } = require('./config');
const db = require('./db');
const authRoutes    = require('./routes/auth');
const cardsRoutes   = require('./routes/cards');
const paymentRoutes = require('./routes/payment');
const catalogRoutes = require('./routes/catalog');
const postsRoutes   = require('./routes/posts');
const adminRoutes   = require('./routes/admin');
const reviewsRoutes      = require('./routes/reviews');
const transactionsRoutes = require('./routes/transactions');
const reportsRoutes      = require('./routes/reports');
const statementsRoutes   = require('./routes/statements');
const accountRoutes      = require('./routes/account');
const { startMonthlyJob } = require('./lib/monthly-job');
const { autoSeedIfEmpty } = require('./routes/catalog');

const app = express();

// --- CORS ---
// Do tarah ke clients: extension (chrome-extension:// origin) aur website
// (https://cardwiz.in). Extension: dev mein sab allow, prod mein configured IDs.
// Website: allowedWebOrigins whitelist (Bearer token, koi cookie nahi -> credentials nahi).
const extOrigins = config.allowedExtensionIds.map((id) => `chrome-extension://${id}`);
const webOrigins = config.allowedWebOrigins;
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / health checks
      if (origin.startsWith('chrome-extension://')) {
        if (extOrigins.length === 0) return cb(null, true); // dev: sabhi extensions
        return cb(null, extOrigins.includes(origin)); // prod: whitelist
      }
      return cb(null, webOrigins.includes(origin)); // website origins
    },
  })
);

app.use(express.json());

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'cardwiz-backend', db: db.kind });
});

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/cards', cardsRoutes);
app.use('/payment', paymentRoutes);
app.use('/catalog', catalogRoutes);
app.use('/posts', postsRoutes);
app.use('/admin', adminRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/reports', reportsRoutes);
app.use('/statements', statementsRoutes);
app.use('/account', accountRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// --- Boot ---
async function start() {
  const problems = validate();
  if (problems.length) {
    console.error('\n⚠️  Config incomplete:');
    for (const p of problems) console.error('   - ' + p);
    console.error('   backend/README.md mein setup steps hain.\n');
    // Phir bhi boot karte hain taaki /health chale, lekin /auth/google fail karega.
  }

  await db.init();
  await autoSeedIfEmpty(); // Supabase empty ho to cards.json se seed karo
  startMonthlyJob();

  app.listen(config.port, () => {
    console.log(`\n✅ CardWiz backend chal raha hai: http://localhost:${config.port}`);
    console.log(`   health: http://localhost:${config.port}/health\n`);
  });
}

start().catch((err) => {
  console.error('Backend start nahi hua:', err);
  process.exit(1);
});
