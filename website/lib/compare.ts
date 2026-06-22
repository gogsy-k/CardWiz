/*
 * "Card A vs Card B" SEO comparison pages.
 * URL: /compare/<idA>-vs-<idB>  (e.g. /compare/hdfc-millennia-vs-sbi-cashback)
 * Card ids contain hyphens but never the literal "-vs-", so we split on that.
 */

// Popular head-to-head pairs — pre-rendered for SEO. Baaki pairs on-demand render hote hain.
export const COMPARE_PAIRS: [string, string][] = [
  ["hdfc-millennia", "sbi-cashback"],
  ["amazon-pay-icici", "sbi-cashback"],
  ["hdfc-millennia", "amazon-pay-icici"],
  ["flipkart-axis", "amazon-pay-icici"],
  ["axis-magnus", "axis-atlas"],
  ["hdfc-infinia", "axis-magnus"],
  ["hdfc-infinia", "axis-atlas"],
  ["hdfc-regalia-gold", "hdfc-millennia"],
  ["axis-ace", "hdfc-millennia"],
  ["sbi-cashback", "flipkart-axis"],
  ["icici-coral", "sbi-simplyclick"],
  ["idfc-first-wealth", "idfc-first-select"],
  ["hdfc-pixel-play", "amazon-pay-icici"],
  ["hsbc-cashback", "sbi-cashback"],
  ["hdfc-swiggy", "amazon-pay-icici"],
  ["axis-ace", "amazon-pay-icici"],
];

export function pairToSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}

export function parsePair(slug: string): [string, string] | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}
