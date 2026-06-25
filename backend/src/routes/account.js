/*
 * Account preferences — email opt-in/out.
 * DPDP Act: default off, explicit opt-in only.
 */
'use strict';

const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const db = require('../db');
const { computeMissedSavings } = require('../lib/missed-savings');
const { sendMonthlyReport } = require('../lib/email');
const { hasPremium } = require('../config');

const router = express.Router();

// GET /account/email-prefs → { emailReports: bool }
router.get('/email-prefs', requireAuth, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    res.json({ emailReports: !!(user && user.emailReports) });
  } catch (err) {
    console.error('[account/email-prefs GET]', err.message);
    res.status(502).json({ error: 'Could not fetch prefs' });
  }
});

// POST /account/email-prefs  body: { enabled: boolean }
router.post('/email-prefs', requireAuth, async (req, res) => {
  if (!hasPremium(req.user.plan)) {
    return res.status(403).json({ error: 'premium_required' });
  }

  const enabled = !!req.body.enabled;
  try {
    await db.users.updateEmailPrefs(req.user.id, enabled);
    res.json({ ok: true, emailReports: enabled });
  } catch (err) {
    console.error('[account/email-prefs POST]', err.message);
    res.status(502).json({ error: 'Could not update prefs' });
  }
});

// POST /account/test-report  (admin only) — send a sample monthly report email
// to the calling admin. Confirms the Resend pipeline end-to-end. Safe to keep
// (admin-gated). Uses real last-month data if available, else sample numbers.
router.post('/test-report', requireAdmin, async (req, res) => {
  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'resend_not_configured', message: 'RESEND_API_KEY not set on server' });
  }

  // Last calendar month range.
  const now = new Date();
  const y = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
  const m = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth();
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to   = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const forMonth = new Date(Date.UTC(y, m - 1, 1));

  let report;
  let usedSampleData = false;
  try {
    const [walletEntries, txns, catalogCards] = await Promise.all([
      db.cards.list(req.user.id),
      db.transactions.list(req.user.id, { from, to }),
      db.catalog.list(),
    ]);
    if (txns.length > 0) {
      report = computeMissedSavings(txns, walletEntries, catalogCards);
    } else {
      usedSampleData = true;
    }
  } catch {
    usedSampleData = true;
  }

  if (usedSampleData) {
    report = {
      totalSpend: 48500,
      actualRewards: 620,
      possibleRewards: 1180,
      missed: 560,
      byCategory: [
        { category: 'online_shopping', betterCardName: 'Amazon Pay ICICI', rateIfUsed: 5 },
      ],
    };
  }

  try {
    const result = await sendMonthlyReport({
      to: req.user.email,
      name: req.user.name || 'there',
      reportData: report,
      forMonth,
    });
    res.json({ ok: true, sentTo: req.user.email, usedSampleData, resend: result });
  } catch (err) {
    console.error('[account/test-report]', err.message);
    res.status(502).json({ error: 'send_failed', message: err.message });
  }
});

module.exports = router;
