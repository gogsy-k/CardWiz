import { authedFetch } from "@/lib/auth";

export type PointReason = "review" | "transaction" | "offer" | "checkin" | "referral" | "redeem";

export type LedgerEntry = {
  delta: number;
  reason: PointReason;
  refId: string | null;
  createdAt: string;
  label: string;
};

export type RewardsResponse = {
  points: number;
  history: LedgerEntry[];
  earnRates: Record<string, number>;
};

export async function getRewards(): Promise<RewardsResponse> {
  const res = await authedFetch("/rewards");
  if (!res.ok) throw new Error(`Rewards fetch failed (${res.status})`);
  return res.json();
}
