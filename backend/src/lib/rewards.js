/*
 * CardWiz Rewards — points config + award helper.
 * Earning is idempotent per (user, reason, refId) so an action credits once.
 */
'use strict';

const db = require('../db');

// Points per action.
const POINTS = {
  review: 50,      // write a card review (once per card)
  transaction: 10, // log a spend (once per txn)
  offer: 30,       // submit a bank offer that gets approved (once per offer)
  checkin: 5,      // daily check-in
  referral: 100,   // refer a friend (Phase 3)
};

const STREAK_BONUS = 25; // extra points each time a 7-day streak milestone is hit

// Redeem catalog — points -> days of a plan. Stacks (extends current expiry).
const REDEEM_OPTIONS = [
  { id: 'prem7', cost: 500, plan: 'premium', days: 7 },
  { id: 'prem30', cost: 1500, plan: 'premium', days: 30 },
];

// Human labels for the activity feed (frontend also localizes).
const REASON_LABEL = {
  review: 'Card review',
  transaction: 'Logged a transaction',
  offer: 'Bank offer approved',
  checkin: 'Daily check-in',
  streak: 'Streak bonus',
  referral: 'Referral',
  redeem: 'Redeemed for Premium',
};

// Today's calendar date in IST (YYYY-MM-DD) — streaks align with the user's day.
function istDateStr(d = new Date()) {
  return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

// Consecutive-day streak from check-in date strings, ending today or yesterday.
function computeStreak(dates) {
  const set = new Set(dates);
  let cursor = new Date();
  if (!set.has(istDateStr(cursor))) cursor = new Date(cursor.getTime() - 86400000); // grace: not yet today
  let streak = 0;
  while (set.has(istDateStr(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

// Fire-and-forget award. Never throws into the request path.
async function award(userId, reason, refId = null) {
  const delta = POINTS[reason];
  if (!userId || !delta) return;
  try {
    await db.points.award(userId, { delta, reason, refId });
  } catch (err) {
    console.error('[rewards/award]', reason, err.message);
  }
}

module.exports = { POINTS, STREAK_BONUS, REDEEM_OPTIONS, REASON_LABEL, award, istDateStr, computeStreak };
