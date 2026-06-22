import { BACKEND_URL } from "@/lib/api";

export type SubscribeResult = { ok: true; alreadySubscribed: boolean };

/**
 * Add an email to the launch waitlist.
 * Throws Error("invalid_email") on 400, Error("rate_limit") on 429.
 */
export async function subscribeLaunch(email: string): Promise<SubscribeResult> {
  const res = await fetch(`${BACKEND_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.status === 400) throw new Error("invalid_email");
  if (res.status === 429) throw new Error("rate_limit");
  if (!res.ok) throw new Error("failed");

  return res.json();
}
