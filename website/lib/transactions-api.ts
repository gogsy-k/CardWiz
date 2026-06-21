import { authedFetch } from "./auth";

export type Transaction = {
  id: string;
  userId: string;
  cardId: string | null;
  date: string;       // YYYY-MM-DD
  merchant: string;
  amount: number;
  category: string;
  source: "manual" | "pdf";
  createdAt: string;
};

export type TransactionsResponse = {
  transactions: Transaction[];
  count: number;
  freeLimit: number;
};

export async function listTransactions(params?: {
  from?: string;
  to?: string;
}): Promise<TransactionsResponse> {
  const q = new URLSearchParams();
  if (params?.from) q.set("from", params.from);
  if (params?.to)   q.set("to",   params.to);
  const res = await authedFetch(`/transactions${q.size ? `?${q}` : ""}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<TransactionsResponse>;
}

export async function addTransaction(data: {
  cardId?: string;
  date: string;
  merchant?: string;
  amount: number;
  category: string;
}): Promise<Transaction> {
  const res = await authedFetch("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.status === 403) {
    const err = await res.json().catch(() => ({})) as { error?: string; limit?: number };
    if (err.error === "free_limit") throw Object.assign(new Error("free_limit"), { limit: err.limit });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return (json as { transaction: Transaction }).transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await authedFetch(`/transactions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
