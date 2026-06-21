/*
 * Monthly email report job — 1st of every month at 9am IST (3:30am UTC).
 * Sends a Missed Savings summary to all Premium users who opted in.
 */
'use strict';

const cron = require('node-cron');
const db = require('../db');
const { computeMissedSavings } = require('./missed-savings');
const { sendMonthlyReport } = require('./email');

// Returns { from, to } for the previous calendar month.
function lastMonthRange() {
  const now = new Date();
  const year  = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
  const month = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth(); // 1-indexed last month
  const from  = `${year}-${String(month).padStart(2, '0')}-01`;
  // last day of the month
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to, forMonth: new Date(Date.UTC(year, month - 1, 1)) };
}

async function runMonthlyJob() {
  console.log('[monthly-job] Starting monthly email run…');
  const { from, to, forMonth } = lastMonthRange();

  let users;
  try {
    users = await db.users.listPremiumEmailUsers();
  } catch (err) {
    console.error('[monthly-job] Could not fetch users:', err.message);
    return;
  }

  console.log(`[monthly-job] ${users.length} opted-in Premium users. Period: ${from} to ${to}`);

  let sent = 0, skipped = 0, failed = 0;

  const catalogCards = await db.catalog.list();

  for (const user of users) {
    try {
      const [walletEntries, txns] = await Promise.all([
        db.cards.list(user.id),
        db.transactions.list(user.id, { from, to }),
      ]);

      if (txns.length === 0) { skipped++; continue; }

      const report = computeMissedSavings(txns, walletEntries, catalogCards);

      await sendMonthlyReport({
        to: user.email,
        name: user.name || 'there',
        reportData: report,
        forMonth,
      });

      sent++;
    } catch (err) {
      console.error(`[monthly-job] Failed for ${user.email}:`, err.message);
      failed++;
    }
  }

  console.log(`[monthly-job] Done. sent=${sent} skipped=${skipped} failed=${failed}`);
}

function startMonthlyJob() {
  // 3:30am UTC = 9:00am IST, 1st of every month
  cron.schedule('30 3 1 * *', () => {
    runMonthlyJob().catch((err) => console.error('[monthly-job] Uncaught:', err.message));
  });
  console.log('[monthly-job] Scheduled: 1st of month, 9am IST');
}

module.exports = { startMonthlyJob, runMonthlyJob };
