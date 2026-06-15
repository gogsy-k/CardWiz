import { BACKEND_URL } from "./api";

export type CardRule = {
  categories: string[];
  effectiveRate: number;
  rawRate: string;
  monthlyCapValue: number | null;
};

export type Card = {
  id: string;
  name: string;
  bank: string;
  network: string;
  cardType: "credit" | "debit";
  type: "cashback" | "points" | "miles";
  pointValueINR: number;
  annualFee: number;
  feeWaiverSpend: number;
  baseRate: number;
  baseMonthlyCapValue: number | null;
  rules: CardRule[];
  exclusions: string[];
  fuelSurchargeWaiver?: boolean;
  lastVerified?: string;
};

// Catalog ko 1 ghante cache karte hain — backend cold-start har request pe nahi jhelni.
export async function getCards(): Promise<Card[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/catalog`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const cards: Card[] = data.cards ?? data ?? [];
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
}

export async function getCard(id: string): Promise<Card | null> {
  const cards = await getCards();
  return cards.find((c) => c.id === id) ?? null;
}

// ---- Display helpers ----

export const TYPE_LABEL: Record<Card["type"], string> = {
  cashback: "Cashback",
  points: "Reward Points",
  miles: "Travel Miles",
};

// Card ka best (highest) reward rate, display ke liye.
export function topRate(card: Card): number {
  const rates = (card.rules ?? []).map((r) => r.effectiveRate);
  return Math.max(card.baseRate ?? 0, ...(rates.length ? rates : [0]));
}

// Saari unique categories jaha is card pe accelerated reward milta hai.
export function cardCategories(card: Card): string[] {
  const set = new Set<string>();
  for (const r of card.rules ?? []) for (const c of r.categories ?? []) set.add(c);
  return [...set];
}

export const CATEGORY_LABEL: Record<string, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  myntra: "Myntra",
  online_shopping: "Online Shopping",
  food_delivery: "Food Delivery",
  dining: "Dining",
  grocery: "Grocery",
  fuel: "Fuel",
  travel: "Travel",
  flights: "Flights",
  hotels: "Hotels",
  entertainment: "Entertainment",
  utilities: "Utilities",
  uber: "Cabs",
  rent: "Rent",
  education: "Education",
  insurance: "Insurance",
  offline: "Offline / In-store",
};

export function prettyCategory(c: string): string {
  return CATEGORY_LABEL[c] ?? c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function formatFee(card: Card): string {
  if (!card.annualFee || card.annualFee === 0) return "Lifetime Free";
  return `₹${card.annualFee.toLocaleString("en-IN")}/yr`;
}
