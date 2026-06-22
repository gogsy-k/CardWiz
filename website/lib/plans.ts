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
    // pros now hold i18n keys (resolved via t() in PricingPlans) — see site-i18n pp_*
    pros: [
      "pp_checkout",
      "pp_sites",
      "pp_wallet3",
      "pp_billrem",
      "pp_offerdet",
      "pp_ai5",
      "pp_community",
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
      "pp_all_free",
      "pp_unlimited_cards",
      "pp_sync",
      "pp_portfolio",
      "pp_trackers",
      "pp_benefits",
      "pp_missed",
      "pp_pdf",
      "pp_report",
      "pp_ai_unlimited",
      "pp_watchlist",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Maximum bachat, power users ke liye.",
    monthly: 99,
    yearly: 799,
    cta: "notify",
    pros: [
      "pp_all_premium",
      "pp_priority",
      "pp_early",
      "pp_csv",
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
