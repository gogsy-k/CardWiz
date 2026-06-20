/*
 * CardWiz — "Find My Card" quiz engine.
 * --------------------------------------------------------------------
 * Ports the rule-matching + cap-clamp logic from the extension's recommend.js
 * to TypeScript. The ranking backbone is a single honest number:
 *
 *     ongoingNetAnnual = (annual reward across the user's spend) − effective fee
 *
 * `effectiveRate` in the catalog is ALREADY ₹-normalized (e.g. HDFC Infinia
 * "5 RP per ₹150" → effectiveRate 3.3), so cashback / points / miles compare
 * directly — we do NOT multiply by pointValueINR (that would double-count).
 *
 * Soft factors (reward-type preference, forex, eligibility) are ADDITIVE nudges
 * capped to ±NUDGE_CAP_INR so they can only reorder genuinely-comparable cards —
 * the net-₹ backbone always wins when the gap is meaningful. Welcome value is a
 * separate labeled line and only ever a tie-breaker, never folded into the sort.
 */

import type { Card } from "./cards";
import { ENRICHMENT } from "./card-enrichment";

// ---- Answer shape ----
export type CategoryKey = "online" | "travel" | "food" | "daily" | "utility" | "entertainment";

export type QuizAnswers = {
  q1: CategoryKey; // primary spend
  q2: CategoryKey; // secondary spend
  monthlySpend: number; // q3
  usage: "domestic" | "mixed" | "international" | "business"; // q4
  rewardPref: "cashback" | "points" | "miles" | "premium"; // q5
  maxFee: number; // q6: 0 | 1000 | 3000 | 999999
  experience: "beginner" | "1card" | "experienced" | "expert"; // q7
  creditScore: "unknown" | "low" | "good" | "excellent"; // q8
};

// Verified against the 23 real catalog tags — no "bills" tag exists; a unit test
// guards this from drift (a typo'd tag would silently fall to baseRate otherwise).
const CATEGORY_MAP: Record<CategoryKey, string[]> = {
  online: ["amazon", "flipkart", "myntra", "online_shopping"],
  travel: ["travel", "flights", "hotels"],
  food: ["dining", "food_delivery", "instamart"],
  daily: ["grocery", "fuel", "offline"],
  utility: ["utilities", "insurance"],
  entertainment: ["entertainment", "gaming"],
};

// Tunables
const NUDGE_CAP_INR = 500; // ±cap on soft nudge → backbone preserved beyond ₹1,000/yr gaps
const WELCOME_TIEBREAK_BAND = 1000; // only tie-break welcome between cards within this ongoing-₹ band

// Approximate CIBIL numbers for the q8 bands (for the soft eligibility flag).
const SCORE_BAND: Record<QuizAnswers["creditScore"], number | null> = {
  unknown: null,
  low: 650,
  good: 730,
  excellent: 780,
};

// ---- Structured reasons (engine stays i18n-free; the component formats these) ----
export type Reason =
  | { kind: "reward"; category: string; rate: number }
  | { kind: "ltf" }
  | { kind: "feeWaived"; spend: number };

export type CardRec = {
  card: Card;
  ongoingNetAnnual: number; // THE honest figure shown to the user
  annualReward: number;
  effFee: number;
  feeWaived: boolean;
  welcomeValueINR?: number; // separate "first-year bonus" line, only when known
  reasons: Reason[];
  eligibilityFlag: boolean; // true → "better approval odds with a higher score"
  score: number; // internal ranking key (net + capped nudge)
};

export type QuizResult = {
  results: CardRec[]; // hero = [0], alternatives = [1..]
  fallback: boolean; // true → maxFee was dropped to avoid an empty list
};

type GroupHit = {
  reward: number; // monthly ₹
  rate: number; // effectiveRate used
  category: string | null; // matched accelerated category (null = base rate)
};

// Reward for one category-group on a monthly spend slice, clamped to the rule's
// monthly cap. `capLeftByRule` is a shared ledger so a single rule that covers
// BOTH the primary and secondary group can't pay its full cap twice.
function rewardForGroup(
  card: Card,
  cats: string[],
  monthlySlice: number,
  capLeftByRule: Record<string, number>
): GroupHit {
  let best: { rate: number; cap: number | null; ruleId: string; category: string } | null = null;
  (card.rules ?? []).forEach((rule, i) => {
    const hitCat = (rule.categories ?? []).find((c) => cats.includes(c));
    if (hitCat && (!best || rule.effectiveRate > best.rate)) {
      best = { rate: rule.effectiveRate, cap: rule.monthlyCapValue, ruleId: `r${i}`, category: hitCat };
    }
  });

  // No accelerated rule → base rate, no cap, no chip.
  if (!best) {
    return { reward: (card.baseRate ?? 0) * 0.01 * monthlySlice, rate: card.baseRate ?? 0, category: null };
  }

  const b: { rate: number; cap: number | null; ruleId: string; category: string } = best;
  let monthly = b.rate * 0.01 * monthlySlice;
  if (b.cap != null) {
    const remaining = capLeftByRule[b.ruleId] ?? b.cap;
    monthly = Math.min(monthly, Math.max(0, remaining));
    capLeftByRule[b.ruleId] = Math.max(0, remaining - monthly);
  }
  return { reward: monthly, rate: b.rate, category: b.category };
}

// ---- The honest backbone: ongoing net annual ₹ ----
function computeOngoing(card: Card, a: QuizAnswers) {
  const total = a.monthlySpend;
  const primaryCats = CATEGORY_MAP[a.q1];
  const secondaryCats = CATEGORY_MAP[a.q2];
  const capLeft: Record<string, number> = {};

  // Dedup by KEY (not array identity) so an overlapping primary/secondary doesn't double-count.
  const same = a.q1 === a.q2;
  const pSlice = same ? 0.55 * total : 0.4 * total;
  const sSlice = same ? 0 : 0.25 * total;
  const baseSlice = same ? 0.45 * total : 0.35 * total;

  const p = rewardForGroup(card, primaryCats, pSlice, capLeft);
  const s = same
    ? { reward: 0, rate: 0, category: null as string | null }
    : rewardForGroup(card, secondaryCats, sSlice, capLeft);
  const baseMonthly = (card.baseRate ?? 0) * 0.01 * baseSlice;

  const annualReward = 12 * (p.reward + s.reward + baseMonthly);

  // Effective fee: waived if annual spend clears feeWaiverSpend — BUT the
  // "Lifetime Free only" bucket (maxFee 0) disables the waiver exception.
  const annualSpend = total * 12;
  const feeWaived =
    a.maxFee !== 0 && !!card.feeWaiverSpend && annualSpend >= card.feeWaiverSpend && card.annualFee > 0;
  const effFee = feeWaived ? 0 : card.annualFee ?? 0;

  return { annualReward, ongoingNetAnnual: annualReward - effFee, effFee, feeWaived, p, s };
}

// premium preference → cards that actually carry premium perks (miles, or a real fee)
function matchesRewardPref(card: Card, pref: QuizAnswers["rewardPref"]): boolean {
  if (pref === "premium") return card.type === "miles" || (card.annualFee ?? 0) >= 2500;
  return card.type === pref;
}

// Additive bonus fraction (scaled later by annualReward, then capped). Never multiplies a possibly-negative net.
function bonusFraction(card: Card, a: QuizAnswers): number {
  let f = 0;

  // Reward-type preference (soft bonus, NOT a filter).
  if (matchesRewardPref(card, a.rewardPref)) f += 0.05;

  // Forex — only when usage is intl/business AND markup is known (unknown = neutral, no penalty).
  if (a.usage === "international" || a.usage === "business") {
    const fx = ENRICHMENT[card.id]?.forexMarkup;
    if (fx != null) {
      if (fx <= 2) f += 0.08;
      else if (fx <= 3.5) f += 0.04;
    }
  }

  // Eligibility heuristic — gentle nudge for new / low-score users toward mass-market cards.
  const cautious = a.experience === "beginner" || a.experience === "1card" || a.creditScore === "low" || a.creditScore === "unknown";
  if (cautious) {
    const fee = card.annualFee ?? 0;
    if (fee <= 1500) f += 0.05;
    else if (fee >= 5000) f -= 0.05;
  }

  return f;
}

function buildReasons(card: Card, o: ReturnType<typeof computeOngoing>): Reason[] {
  const reasons: Reason[] = [];
  if (o.p.category) reasons.push({ kind: "reward", category: o.p.category, rate: o.p.rate });
  if (o.s.category && o.s.category !== o.p.category) reasons.push({ kind: "reward", category: o.s.category, rate: o.s.rate });
  if ((card.annualFee ?? 0) === 0) reasons.push({ kind: "ltf" });
  else if (o.feeWaived) reasons.push({ kind: "feeWaived", spend: card.feeWaiverSpend });
  return reasons;
}

function scoreCard(card: Card, a: QuizAnswers): CardRec {
  const o = computeOngoing(card, a);

  // Additive, capped nudge — backbone-preserving (see file header).
  const rawNudge = o.annualReward * bonusFraction(card, a);
  const nudge = Math.max(-NUDGE_CAP_INR, Math.min(NUDGE_CAP_INR, rawNudge));

  // Eligibility flag (soft, display-only): known minCreditScore clearly above the user's band.
  const minScore = ENRICHMENT[card.id]?.minCreditScore;
  const userScore = SCORE_BAND[a.creditScore];
  const eligibilityFlag = minScore != null && userScore != null && minScore > userScore;

  return {
    card,
    ongoingNetAnnual: Math.round(o.ongoingNetAnnual),
    annualReward: Math.round(o.annualReward),
    effFee: o.effFee,
    feeWaived: o.feeWaived,
    welcomeValueINR: ENRICHMENT[card.id]?.welcomeValueINR,
    reasons: buildReasons(card, o),
    eligibilityFlag,
    score: o.ongoingNetAnnual + nudge,
  };
}

// Hard fee constraint (only this + credit-only actually filter).
function feeOk(card: Card, a: QuizAnswers): boolean {
  if (a.maxFee === 0) return (card.annualFee ?? 0) === 0; // true Lifetime Free, no waiver exception
  if ((card.annualFee ?? 0) <= a.maxFee) return true;
  const annualSpend = a.monthlySpend * 12;
  return !!card.feeWaiverSpend && annualSpend >= card.feeWaiverSpend; // waived-by-spend counts as acceptable
}

// Welcome value is a tie-breaker ONLY among cards within an absolute ongoing-₹ band.
// Unknown welcome is treated as -1 for ordering (so a known bonus edges ahead within
// the band) but is NEVER subtracted from the score — unknown ≠ penalty.
function compare(a: CardRec, b: CardRec): number {
  if (Math.abs(a.ongoingNetAnnual - b.ongoingNetAnnual) <= WELCOME_TIEBREAK_BAND) {
    const wa = a.welcomeValueINR ?? -1;
    const wb = b.welcomeValueINR ?? -1;
    if (wa !== wb) return wb - wa;
  }
  return b.score - a.score;
}

export function getRecommendations(cards: Card[], a: QuizAnswers): QuizResult {
  const credit = (cards ?? []).filter((c) => c.cardType === "credit");

  let pool = credit.filter((c) => feeOk(c, a));
  let fallback = false;
  if (pool.length === 0) {
    pool = credit; // never-empty: drop the fee constraint, label as closest matches
    fallback = true;
  }

  const results = pool.map((c) => scoreCard(c, a)).sort(compare).slice(0, 5);
  return { results, fallback };
}

// Exposed for unit tests (drift + correctness guards).
export const __test = { CATEGORY_MAP, rewardForGroup, computeOngoing, NUDGE_CAP_INR };
