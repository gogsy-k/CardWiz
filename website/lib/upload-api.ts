import { getToken } from "./auth";
import { BACKEND_URL } from "./api";

export type ParsedTransaction = {
  date: string;
  merchant: string;
  amount: number;
  category: string | null;
};

export type ParseResponse = {
  parsed: ParsedTransaction[];
  count: number;
  warnings: string[];
};

// File upload — can't use authedFetch (needs multipart not JSON)
export async function uploadStatement(file: File): Promise<ParseResponse> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");

  const form = new FormData();
  form.append("statement", file);

  const res = await fetch(`${BACKEND_URL}/statements/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (res.status === 403) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    if (err.error === "premium_required") throw Object.assign(new Error("premium_required"), {});
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; detail?: string };
    throw new Error(err.detail || err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ParseResponse>;
}

export async function bulkImport(data: {
  transactions: { date: string; merchant: string; amount: number; category: string; cardId?: string }[];
  cardId?: string;
}): Promise<{ created: number }> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");

  const res = await fetch(`${BACKEND_URL}/transactions/bulk`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<{ created: number }>;
}
