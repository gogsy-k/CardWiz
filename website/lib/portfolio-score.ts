/*
 * CardWiz Portfolio Score — TypeScript edition.
 * Mirrors portfolioscore.js (extension root). Keep logic in sync.
 * 5 categories × 20 pts = 100 max.
 */
import type { Card } from "./cards";

export type ScoreCat = {
  id: string;
  label: string;
  emoji: string;
  cats: string[];
};

export type CatResult = ScoreCat & {
  covered: boolean;
  points: number;
};

export type Suggestion = {
  cardId: string;
  name: string;
  bank: string;
  forGap: string;
  forGapLabel: string;
};

export type PortfolioScoreResult = {
  score: number;
  strengths: CatResult[];
  gaps: CatResult[];
  suggestions: Suggestion[];
  details: CatResult[];
};

export type WalletEntry = { id: string; cardId: string; [k: string]: unknown };

type CardExt = Card & {
  benefits?: {
    loungePerYear?: number;
    fuelSurchargeWaiver?: boolean;
    [k: string]: unknown;
  };
};

export const SCORE_CATS: ScoreCat[] = [
  { id: "online",  label: "Online / Cashback", emoji: "🛒", cats: ["amazon","flipkart","online_shopping","myntra","entertainment"] },
  { id: "travel",  label: "Travel",             emoji: "✈️", cats: ["travel","flights","hotels","uber","cab"] },
  { id: "dining",  label: "Dining & Food",      emoji: "🍽️", cats: ["dining","food_delivery","instamart"] },
  { id: "fuel",    label: "Fuel",               emoji: "⛽", cats: ["fuel"] },
  { id: "lounge",  label: "Airport Lounge",     emoji: "🛋️", cats: [] },
];

export function portfolioScore(
  walletCards: WalletEntry[],
  allCatalogCards: Card[]
): PortfolioScoreResult {
  const all = allCatalogCards as CardExt[];
  const myCards = walletCards
    .map((mc) => all.find((c) => c.id === mc.cardId))
    .filter((c): c is CardExt => c !== undefined);

  const details: CatResult[] = SCORE_CATS.map((cat) => {
    let covered = false;
    if (cat.id === "lounge") {
      covered = myCards.some(
        (c) => c.benefits && c.benefits.loungePerYear !== 0 && c.benefits.loungePerYear !== undefined
      );
    } else if (cat.id === "fuel") {
      covered = myCards.some(
        (c) =>
          c.fuelSurchargeWaiver ||
          c.benefits?.fuelSurchargeWaiver ||
          c.rules.some((r) => r.categories?.includes("fuel"))
      );
    } else {
      covered = myCards.some((c) =>
        c.rules.some(
          (r) =>
            r.categories?.some((rc) => cat.cats.includes(rc)) &&
            (r.effectiveRate || 0) > (c.baseRate || 0)
        )
      );
    }
    return { ...cat, covered, points: covered ? 20 : 0 };
  });

  const score = details.reduce((s, d) => s + d.points, 0);
  const strengths = details.filter((d) => d.covered);
  const gaps = details.filter((d) => !d.covered);

  const myCardIds = new Set(walletCards.map((mc) => mc.cardId));
  const suggestions: Suggestion[] = [];

  for (const gap of gaps) {
    const rateFor = (c: CardExt) => {
      if (gap.id === "lounge" || gap.id === "fuel") return 1;
      return Math.max(
        0,
        ...c.rules
          .filter((r) => r.categories?.some((rc) => gap.cats.includes(rc)))
          .map((r) => r.effectiveRate || 0)
      );
    };

    const eligible = all
      .filter((c) => !myCardIds.has(c.id))
      .filter((c) => {
        if (gap.id === "lounge") return c.benefits?.loungePerYear;
        if (gap.id === "fuel")   return c.fuelSurchargeWaiver || c.benefits?.fuelSurchargeWaiver;
        return c.rules.some(
          (r) => r.categories?.some((rc) => gap.cats.includes(rc)) && (r.effectiveRate || 0) > (c.baseRate || 0)
        );
      })
      .sort((a, b) => rateFor(b) - rateFor(a));

    const best = eligible[0];
    if (best) {
      suggestions.push({ cardId: best.id, name: best.name, bank: best.bank, forGap: gap.id, forGapLabel: gap.label });
    }
  }

  return { score, strengths, gaps, suggestions, details };
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Great coverage";
  if (score >= 60) return "Good — a few gaps";
  if (score >= 40) return "Moderate coverage";
  if (score > 0)   return "Poor coverage";
  return "No cards added";
}
