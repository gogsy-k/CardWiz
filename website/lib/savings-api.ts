import { authedFetch } from "./auth";
import { BACKEND_URL } from "./api";

export type CategoryMiss = {
  category: string;
  missed: number;
  transactions: number;
  totalSpend: number;
  betterCardId: string | null;
  betterCardName: string | null;
  rateIfUsed: number;
};

export type CardMiss = {
  cardId: string | null;
  cardName: string;
  missed: number;
  transactions: number;
};

export type SavingsReport = {
  empty: boolean;
  emptyReason?: "no_transactions" | "no_wallet";
  preview: boolean;
  totalSpend: number;
  actualRewards: number;
  possibleRewards: number;
  missed: number;
  efficiency: number;
  byCategory: CategoryMiss[];
  byCard: CardMiss[];
  transactionCount: number;
};

export async function getMissedSavings(params?: {
  from?: string;
  to?: string;
}): Promise<SavingsReport> {
  const q = new URLSearchParams();
  if (params?.from) q.set("from", params.from);
  if (params?.to)   q.set("to",   params.to);
  const res = await authedFetch(`/reports/missed-savings${q.size ? `?${q}` : ""}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SavingsReport>;
}
