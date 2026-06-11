/*
 * RewardXtra backend — entry point (Phase 8).
 * Express server: Google SSO + user accounts. Card numbers / CVV kabhi nahi.
 *
 * Run: npm start   (ya npm run dev for auto-reload)
 */
'use strict';

const express = require('express');
const cors = require('cors');

const { config, validate } = require('./config');
const db = require('./db');
const authRoutes = require('./routes/auth');

const app = express();

// --- CORS ---
// Extension popup/service-worker se aane wali requests chrome-extension:// origin
// se aati hain. Dev mein sabhi extension origins allow; production mein sirf
// configured extension ID(s).
const allowed = config.allowedExtensionIds.map((id) => `chrome-extension://${id}`);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / health checks
      if (allowed.length === 0) return cb(null, true); // dev: sab allow
      return cb(null, allowed.includes(origin));
    },
  })
);

app.use(express.json());

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'smartcard-saver-backend', db: db.kind });
});

// --- Routes ---
app.use('/auth', authRoutes);

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

  app.listen(config.port, () => {
    console.log(`\n✅ RewardXtra backend chal raha hai: http://localhost:${config.port}`);
    console.log(`   health: http://localhost:${config.port}/health\n`);
  });
}

start().catch((err) => {
  console.error('Backend start nahi hua:', err);
  process.exit(1);
});
