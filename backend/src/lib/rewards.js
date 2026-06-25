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
  checkin: 5,      // daily check-in (Phase 2)
  referral: 100,   // refer a friend (Phase 3)
};

// Human labels for the activity feed (frontend also localizes).
const REASON_LABEL = {
  review: 'Card review',
  transaction: 'Logged a transaction',
  offer: 'Bank offer approved',
  checkin: 'Daily check-in',
  referral: 'Referral',
  redeem: 'Redeemed for Premium',
};

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

module.exports = { POINTS, REASON_LABEL, award };
