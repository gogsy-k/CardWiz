/*
 * Missed Savings engine — pure logic, no I/O.
 * Shared between routes/reports.js (on-demand) and lib/monthly-job.js (cron).
 */
'use strict';

function rateFor(catalogCard, category) {
  if (!catalogCard) return 0;
  const match = (catalogCard.rules || [])
    .filter((r) => r.categories && r.categories.includes(category))
    .sort((a, b) => (b.effectiveRate || 0) - (a.effectiveRate || 0))[0];
  return match ? (match.effectiveRate || catalogCard.baseRate || 0) : (catalogCard.baseRate || 0);
}

function computeMissedSavings(transactions, walletEntries, catalogCards) {
  const byId = Object.fromEntries(catalogCards.map((c) => [c.id, c]));
  const walletCatalogCards = walletEntries.map((w) => byId[w.cardId]).filter(Boolean);

  let totalSpend = 0, actualRewards = 0, possibleRewards = 0;
  const catMap = {};
  const cardMap = {};

  for (const txn of transactions) {
    const amount = Number(txn.amount);
    totalSpend += amount;

    const usedCard = txn.cardId ? byId[txn.cardId] : null;
    const actualRate = usedCard ? rateFor(usedCard, txn.category) : 0;
    const actualReward = (actualRate * amount) / 100;
    actualRewards += actualReward;

    let bestRate = 0, bestCardId = null;
    for (const wc of walletCatalogCards) {
      const r = rateFor(wc, txn.category);
      if (r > bestRate) { bestRate = r; bestCardId = wc.id; }
    }
    const possibleReward = (bestRate * amount) / 100;
    possibleRewards += possibleReward;

    const missed = possibleReward - actualReward;

    if (!catMap[txn.category]) catMap[txn.category] = { missed: 0, count: 0, spend: 0, bestCardId: null, bestRate: 0 };
    catMap[txn.category].missed += missed;
    catMap[txn.category].count  += 1;
    catMap[txn.category].spend  += amount;
    if (bestRate > catMap[txn.category].bestRate) {
      catMap[txn.category].bestRate   = bestRate;
      catMap[txn.category].bestCardId = bestCardId;
    }

    const ck = txn.cardId || '__none__';
    if (!cardMap[ck]) cardMap[ck] = { cardId: txn.cardId || null, missed: 0, count: 0 };
    cardMap[ck].missed += missed;
    cardMap[ck].count  += 1;
  }

  const missed = possibleRewards - actualRewards;
  const efficiency = possibleRewards > 0 ? Math.round((actualRewards / possibleRewards) * 100) : 100;

  const byCategory = Object.entries(catMap)
    .map(([category, d]) => ({
      category,
      missed: Math.round(d.missed * 100) / 100,
      transactions: d.count,
      totalSpend: Math.round(d.spend * 100) / 100,
      betterCardId: d.bestCardId,
      betterCardName: d.bestCardId ? (byId[d.bestCardId]?.name || d.bestCardId) : null,
      rateIfUsed: d.bestRate,
    }))
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 8);

  const byCard = Object.values(cardMap)
    .map((d) => ({
      cardId: d.cardId,
      cardName: d.cardId ? (byId[d.cardId]?.name || d.cardId) : 'Card not specified',
      missed: Math.round(d.missed * 100) / 100,
      transactions: d.count,
    }))
    .sort((a, b) => b.missed - a.missed);

  return {
    totalSpend:      Math.round(totalSpend * 100) / 100,
    actualRewards:   Math.round(actualRewards * 100) / 100,
    possibleRewards: Math.round(possibleRewards * 100) / 100,
    missed:          Math.round(missed * 100) / 100,
    efficiency,
    byCategory,
    byCard,
    transactionCount: transactions.length,
  };
}

module.exports = { rateFor, computeMissedSavings };
