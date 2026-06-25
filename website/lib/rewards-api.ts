import { authedFetch } from "@/lib/auth";

export type PointReason = "review" | "transaction" | "offer" | "checkin" | "referral" | "redeem";

export type LedgerEntry = {
  delta: number;
  reason: PointReason;
  refId: string | null;
  createdAt: string;
  label: string;
};

export type RedeemOption = { id: string; cost: number; plan: string; days: number };

export type RewardsResponse = {
  points: number;
  history: LedgerEntry[];
  earnRates: Record<string, number>;
  streak: number;
  checkedInToday: boolean;
  redeemOptions: RedeemOption[];
  plan: string;
  planUntil: string | null;
};

export async function getRewards(): Promise<RewardsResponse> {
  const res = await authedFetch("/rewards");
  if (!res.ok) throw new Error(`Rewards fetch failed (${res.status})`);
  return res.json();
}

export type LeaderRow = { id: string; name: string; picture: string | null; plan: string; earned: number };
export type LeaderboardResponse = { top: LeaderRow[]; me: { id: string; rank: number; earned: number } };

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const res = await authedFetch("/rewards/leaderboard");
  if (!res.ok) throw new Error(`Leaderboard failed (${res.status})`);
  return res.json();
}

export async function checkin(): Promise<{ awarded: boolean; points: number; streak: number; gotBonus: boolean }> {
  const res = await authedFetch("/rewards/checkin", { method: "POST" });
  if (!res.ok) throw new Error(`Check-in failed (${res.status})`);
  return res.json();
}

export async function redeem(
  optionId: string,
): Promise<{ ok: boolean; points: number; plan: string; planUntil: string | null }> {
  const res = await authedFetch("/rewards/redeem", { method: "POST", body: JSON.stringify({ optionId }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Redeem failed (${res.status})`);
  return data;
}
