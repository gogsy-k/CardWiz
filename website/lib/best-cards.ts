import { type Card } from "./cards";

/*
 * "Best Card for X" SEO pages — curated, high-intent categories.
 * Sirf un cards ko rank karte hain jinke paas us category ka explicit
 * accelerated reward rule hai (base-rate-only cards filter out).
 */

export type BestCategory = {
  slug: string;      // URL segment → /best-card-for/<slug>
  category: string;  // catalog category key (card.rules[].categories)
  label: string;     // display name
  blurb: string;     // 1-line intent phrasing (Hinglish)
};

export const BEST_CARD_CATEGORIES: BestCategory[] = [
  { slug: "amazon",         category: "amazon",          label: "Amazon",          blurb: "Amazon par shopping" },
  { slug: "flipkart",       category: "flipkart",        label: "Flipkart",        blurb: "Flipkart par shopping" },
  { slug: "myntra",         category: "myntra",          label: "Myntra",          blurb: "Myntra par fashion" },
  { slug: "online-shopping",category: "online_shopping", label: "Online Shopping", blurb: "online shopping" },
  { slug: "dining",         category: "dining",          label: "Dining",          blurb: "restaurants aur dining" },
  { slug: "food-delivery",  category: "food_delivery",   label: "Food Delivery",   blurb: "Swiggy / Zomato food delivery" },
  { slug: "grocery",        category: "grocery",         label: "Grocery",         blurb: "grocery aur supermarket" },
  { slug: "fuel",           category: "fuel",            label: "Fuel",            blurb: "petrol / diesel" },
  { slug: "travel",         category: "travel",          label: "Travel",          blurb: "travel bookings" },
  { slug: "flights",        category: "flights",         label: "Flights",         blurb: "flight tickets" },
  { slug: "hotels",         category: "hotels",          label: "Hotels",          blurb: "hotel bookings" },
  { slug: "entertainment",  category: "entertainment",   label: "Entertainment",   blurb: "OTT aur entertainment" },
  { slug: "utilities",      category: "utilities",       label: "Utility Bills",   blurb: "utility / bill payments" },
];

export function getBestCategory(slug: string): BestCategory | undefined {
  return BEST_CARD_CATEGORIES.find((c) => c.slug === slug);
}

export type RankedCard = { card: Card; rate: number };

/** Cards jinke paas is category ka explicit reward rule hai, rate-desc se ranked. */
export function rankCardsForCategory(cards: Card[], category: string, limit = 8): RankedCard[] {
  return cards
    .map((c) => {
      const rule = (c.rules ?? []).find((r) => r.categories?.includes(category));
      return rule ? { card: c, rate: rule.effectiveRate } : null;
    })
    .filter((x): x is RankedCard => x !== null && x.rate > 0)
    .sort((a, b) => b.rate - a.rate || (a.card.annualFee ?? 0) - (b.card.annualFee ?? 0))
    .slice(0, limit);
}
