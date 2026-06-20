/*
 * CardWiz — optional per-card enrichment for the "Find My Card" quiz.
 * --------------------------------------------------------------------
 * The 195-card catalog has no welcome-benefit / forex / eligibility fields, so
 * these live here separately and grow incrementally. EVERY field is optional and
 * "unknown" — a missing value is NEVER a penalty (see quiz-engine.ts):
 *   • welcomeValueINR — shown as a separate "first-year bonus" line + tie-breaker
 *   • forexMarkup     — soft bonus only when the user travels international
 *   • minCreditScore  — display-only eligibility flag (not in the ranking sort)
 *
 * Values below are INDICATIVE and should be verified against current bank terms
 * before being treated as exact. Seeded only for well-known cards; expand over
 * time (ids must match the catalog — all of these are cross-checked to exist).
 */

export type CardEnrichment = {
  /** Year-1 joining benefit value (vouchers / miles / gift cards), ₹. */
  welcomeValueINR?: number;
  /** Forex markup as a % (lower = better for international spend). */
  forexMarkup?: number;
  /** Approx. minimum CIBIL typically expected — soft flag only. */
  minCreditScore?: number;
  /** Provenance / freshness note. */
  notes?: string;
};

export const ENRICHMENT: Record<string, CardEnrichment> = {
  // ---- Elite / premium (hard eligibility, low forex, big welcome) ----
  "hdfc-infinia": { forexMarkup: 2, minCreditScore: 800, welcomeValueINR: 12500, notes: "indicative; verify joining benefit" },
  "hdfc-diners-black": { forexMarkup: 2, minCreditScore: 780, welcomeValueINR: 10000, notes: "indicative; verify" },
  "icici-emeralde-private-metal": { forexMarkup: 2, minCreditScore: 800, welcomeValueINR: 12000, notes: "indicative; verify" },
  "axis-atlas": { forexMarkup: 3.5, minCreditScore: 750, welcomeValueINR: 5000, notes: "indicative; verify" },
  "amex-platinum-charge": { forexMarkup: 3.5, minCreditScore: 800, welcomeValueINR: 45000, notes: "indicative; high welcome benefit" },
  "amex-gold": { forexMarkup: 3.5, minCreditScore: 750, welcomeValueINR: 4000, notes: "indicative; verify" },

  // ---- Travel / zero-forex ----
  "scapia-federal": { forexMarkup: 0, minCreditScore: 720, notes: "headline 0% forex travel card" },

  // ---- Mid-tier ----
  "hdfc-regalia-gold": { forexMarkup: 2, minCreditScore: 750, welcomeValueINR: 2500, notes: "indicative; verify" },
  "idfc-first-wealth": { forexMarkup: 1.5, minCreditScore: 730, notes: "low forex, LTF" },
  "tataneu-infinity-hdfc": { forexMarkup: 3, minCreditScore: 730, notes: "indicative" },
  "sbi-bpcl-octane": { forexMarkup: 3.5, minCreditScore: 730, welcomeValueINR: 1499, notes: "fuel-focused" },

  // ---- Entry / mass-market (easier eligibility) ----
  "amazon-pay-icici": { forexMarkup: 3.5, minCreditScore: 700, notes: "LTF, beginner-friendly" },
  "idfc-first-millennia": { forexMarkup: 1.5, minCreditScore: 700, notes: "LTF" },
  "onecard": { forexMarkup: 1, minCreditScore: 700, notes: "app-first, LTF, low forex" },
  "sbi-cashback": { forexMarkup: 3.5, minCreditScore: 720, welcomeValueINR: 500, notes: "indicative; verify" },
  "axis-ace": { forexMarkup: 3.5, minCreditScore: 720, notes: "indicative" },
  "flipkart-axis": { forexMarkup: 3.5, minCreditScore: 720, welcomeValueINR: 500, notes: "indicative; verify" },
};
