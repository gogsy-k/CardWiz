import { BACKEND_URL } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";

export type TopCard = { id: string; name: string; bank: string; baseRate: number };

export type ChatResponse = {
  reply: string;
  topCards: TopCard[];
  categories: string[];
  remaining: number;
  isPremium: boolean;
};

export async function sendChatMessage(query: string): Promise<ChatResponse> {
  const stored = getStoredAuth();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (stored?.token) headers["Authorization"] = `Bearer ${stored.token}`;

  const res = await fetch(`${BACKEND_URL}/ai/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  if (res.status === 429) {
    const data = await res.json();
    throw Object.assign(new Error("rate_limit"), { resetInHours: data.resetInHours });
  }
  if (res.status === 503) throw new Error("ai_not_configured");
  if (!res.ok) throw new Error("AI service unavailable");

  return res.json();
}
