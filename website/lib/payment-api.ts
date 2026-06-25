/*
 * CardWiz payment client — talks to the SAME backend as the extension.
 * Flow: POST /payment/subscribe -> Razorpay-hosted shortUrl (user pays there) ->
 * poll POST /payment/verify-subscription until the mandate is authenticated/active.
 * No card data ever touches us — payment happens entirely on Razorpay's page.
 */
import { authedFetch } from "@/lib/auth";

export type PaidTier = "premium" | "pro";
export type SubscribeResult = { shortUrl: string; plan: string; tier: PaidTier; trialDays: number };
export type VerifyResult = { status: "none" | "pending" | "active"; plan: "free" | "premium" | "pro" };

/** Create a Razorpay subscription (monthly/yearly, premium/pro) and get the hosted pay URL. */
export async function startSubscription(
  period: "monthly" | "yearly",
  tier: PaidTier = "premium",
): Promise<SubscribeResult> {
  const res = await authedFetch("/payment/subscribe", {
    method: "POST",
    body: JSON.stringify({ plan: period, tier }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Subscription start failed (${res.status})`);
  }
  return res.json();
}

/** Poll: has the subscription been authorized (card saved / charging)? */
export async function verifySubscription(): Promise<VerifyResult> {
  const res = await authedFetch("/payment/verify-subscription", { method: "POST" });
  if (!res.ok) throw new Error(`Verify failed (${res.status})`);
  return res.json();
}
