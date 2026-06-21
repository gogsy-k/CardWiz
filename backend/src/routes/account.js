/*
 * Account preferences — email opt-in/out.
 * DPDP Act: default off, explicit opt-in only.
 */
'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

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
  if (req.user.plan !== 'premium') {
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

module.exports = router;
