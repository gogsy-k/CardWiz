/*
 * CardWiz pricing plans — single source of truth for the website /pricing page.
 *
 * NOTE: `pros` are placeholder copy. Final per-plan features (especially Premium
 * vs Pro differentiation) will be written later — just edit the arrays below.
 * Prices are in INR. Keep in sync with the extension's premium.js tier constants.
 */

export type PlanId = "free" | "premium" | "pro";
export type BillingPeriod = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** INR per month (0 = free) */
  monthly: number;
  /** INR per year (0 = free) */
  yearly: number;
  /** small ribbon shown on the card, e.g. "Popular" */
  badge?: string;
  /** visually emphasised card */
  highlighted?: boolean;
  /** what the CTA does: install the extension, or register interest (payment not live yet) */
  cta: "install" | "notify";
  pros: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Shuru karne ke liye — hamesha free.",
    monthly: 0,
    yearly: 0,
    cta: "install",
    pros: [
      "Checkout pe best card suggestion",
      "16+ shopping sites (Amazon, Flipkart, Myntra…)",
      "3 cards tak wallet",
      "Bill due-date reminders",
      "Bank offer detection",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Regular shoppers ke liye.",
    monthly: 49,
    yearly: 399,
    badge: "Popular",
    highlighted: true,
    cta: "notify",
    pros: [
      "Sab kuch Free wala, plus —",
      "Unlimited cards",
      "Cloud sync (multi-device)",
      "Portfolio Score + gap recommendations",
      "Fee Waiver & Welcome Bonus Trackers",
      "Card Benefits Dashboard (lounge, movies, fuel)",
      "Manual Transactions + Missed Savings Report (per-category breakdown)",
      "PDF Statement Upload (HDFC, SBI, ICICI, Axis…)",
      "Monthly CardWiz Report Email (opt-in)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Maximum bachat, sab features.",
    monthly: 99,
    yearly: 799,
    cta: "notify",
    pros: [
      "Sab kuch Premium wala, plus —",
      "(Pro features baad mein likhenge)",
    ],
  },
];

/** Yearly savings vs paying monthly for 12 months (0 for free). */
export function yearlySaving(plan: Plan): number {
  if (plan.monthly === 0) return 0;
  return plan.monthly * 12 - plan.yearly;
}

export function priceFor(plan: Plan, period: BillingPeriod): number {
  return period === "yearly" ? plan.yearly : plan.monthly;
}
