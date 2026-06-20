/*
 * Quiz-engine guards. Run:  npx tsx website/lib/quiz-engine.test.ts
 * No network — uses tiny in-memory card fixtures.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Card } from "./cards";
import { getRecommendations, __test, type QuizAnswers } from "./quiz-engine";

// Minimal Card factory.
function card(p: Partial<Card> & { id: string }): Card {
  return {
    name: p.id,
    bank: "Test",
    network: "Visa",
    cardType: "credit",
    type: "cashback",
    pointValueINR: 1,
    annualFee: 0,
    feeWaiverSpend: 0,
    baseRate: 1,
    baseMonthlyCapValue: null,
    rules: [],
    exclusions: [],
    ...p,
  } as Card;
}

const base: QuizAnswers = {
  q1: "online", q2: "online", monthlySpend: 50000, usage: "domestic",
  rewardPref: "cashback", maxFee: 999999, experience: "expert", creditScore: "excellent",
};

// ---- (b) category-match: guards CATEGORY_MAP ↔ catalog drift ----
test("CATEGORY_MAP tags all exist in the real 23-tag catalog vocabulary", () => {
  const VOCAB = new Set([
    "amazon","cab","dining","education","entertainment","flights","flipkart","food_delivery",
    "fuel","gaming","grocery","hotels","instamart","insurance","myntra","offline",
    "online_shopping","rent","travel","uber","upi","utilities","wallet",
  ]);
  for (const [group, tags] of Object.entries(__test.CATEGORY_MAP)) {
    for (const tag of tags) {
      assert.ok(VOCAB.has(tag), `CATEGORY_MAP.${group} has phantom tag "${tag}" (would silently fall to baseRate)`);
    }
  }
});

test("rewardForGroup returns the accelerated rate, not baseRate, for a known category", () => {
  const c = card({ id: "acc", baseRate: 1, rules: [{ categories: ["amazon", "online_shopping"], effectiveRate: 5, rawRate: "5%", monthlyCapValue: null }] });
  const hit = __test.rewardForGroup(c, __test.CATEGORY_MAP.online, 10000, {});
  assert.equal(hit.rate, 5, "should pick the 5% accelerated rule");
  assert.notEqual(hit.category, null, "should report the matched category for the reasoning chip");
});

// ---- (a) negative-net: an additive penalty must not invert ranking ----
test("negative-net card stays below a positive-net card even when penalised", () => {
  const premium = card({ id: "premium", annualFee: 5000, baseRate: 1 }); // net ≈ 960 − 5000 < 0
  const mass = card({ id: "mass", annualFee: 0, baseRate: 2 }); // net ≈ +1920
  // cautious user → mass (+0.05) up, premium (−0.05) down. A multiplicative bug would lift premium.
  const a: QuizAnswers = { ...base, monthlySpend: 8000, experience: "beginner", creditScore: "low" };
  const { results } = getRecommendations([premium, mass], a);
  assert.equal(results[0].card.id, "mass", "positive-net mass card must rank first");
  assert.ok(results[1].ongoingNetAnnual < 0, "premium card is genuinely negative net");
});

// ---- (c) backbone dominance: a soft bonus can't overturn a >₹1,000 net lead ----
test("a reward-type bonus cannot overtake a clearly higher net-₹ card", () => {
  const high = card({ id: "high", type: "cashback", annualFee: 0, baseRate: 2, rules: [{ categories: ["online_shopping", "amazon"], effectiveRate: 5, rawRate: "5%", monthlyCapValue: null }] });
  const low = card({ id: "low", type: "points", annualFee: 0, baseRate: 1, rules: [{ categories: ["online_shopping", "amazon"], effectiveRate: 3, rawRate: "3%", monthlyCapValue: null }] });
  const a: QuizAnswers = { ...base, rewardPref: "points" }; // favours `low`
  const { results } = getRecommendations([high, low], a);
  assert.equal(results[0].card.id, "high", "higher net-₹ card wins despite the loser's type bonus");
  // and the nudge was capped, not applied in full
  const lowRec = results.find((r) => r.card.id === "low")!;
  assert.equal(lowRec.score, lowRec.ongoingNetAnnual + __test.NUDGE_CAP_INR, "nudge clamped to the cap");
});
