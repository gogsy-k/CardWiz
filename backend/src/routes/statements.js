/*
 * Statement upload route.
 *
 *   POST /statements/upload   multipart/form-data, field "statement" (PDF)
 *     → { parsed: [{date, merchant, amount, category}], count, warnings }
 *
 * Premium only. PDF is parsed in-memory; raw bytes are never stored or logged.
 * Caller reviews the parsed list, edits categories, then calls POST /transactions/bulk.
 */
'use strict';

const express = require('express');
const multer  = require('multer');
const { requireAuth } = require('../middleware/auth');
const { parseStatement } = require('../lib/pdf-parser');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('PDF files only'));
    }
  },
});

router.post('/upload', requireAuth, (req, res, next) => {
  if (req.user.plan !== 'premium') {
    return res.status(403).json({ error: 'premium_required' });
  }
  next();
}, upload.single('statement'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const parsed = await parseStatement(req.file.buffer);
    // raw PDF buffer is eligible for GC immediately after this — never stored
    const warnings = [];
    if (parsed.length === 0) {
      warnings.push('No debit transactions found. This PDF format may not be supported yet.');
    } else if (parsed.length < 3) {
      warnings.push('Only a few transactions detected — try a more recent statement or a different month.');
    }
    if (parsed.some((t) => !t.category)) {
      warnings.push('Some transactions could not be auto-categorised. You can set the category before importing.');
    }
    res.json({ parsed, count: parsed.length, warnings });
  } catch (err) {
    console.error('[statements/upload]', err.message);
    if (err.message === 'pdf-parse package not installed') {
      return res.status(503).json({ error: 'PDF parsing not available on this server.' });
    }
    res.status(422).json({
      error: 'Could not parse this PDF.',
      detail: 'Encrypted or scanned PDFs are not supported. Try downloading a fresh statement from your bank.',
    });
  }
});

module.exports = router;
