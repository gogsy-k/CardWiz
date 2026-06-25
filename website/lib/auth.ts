/*
 * CardWiz website auth — talks to the SAME backend + user DB as the extension.
 * Mirrors the extension's auth.js: Google ID token → POST /auth/google → session
 * JWT, stored in localStorage, sent as `Authorization: Bearer` on every call.
 *
 * PRINCIPLE: only account/plan crosses the wire. Never cards / CVV.
 */
import { BACKEND_URL } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
  plan: "free" | "premium" | "pro";
  planUntil?: string | null;
  referralCode?: string | null;
  emailReports?: boolean;
  isAdmin?: boolean;
};

export type StoredAuth = { token: string; user: AuthUser };

/** Paid tiers — Pro includes everything Premium does (pro ⊇ premium). */
export function isPaid(plan: AuthUser["plan"] | undefined | null): boolean {
  return plan === "premium" || plan === "pro";
}

const STORAGE_KEY = "cwAuth";

// ---- localStorage helpers (browser only) ----
export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ---- backend calls ----

// Exchange a Google ID token for our session JWT + user (creates/updates the
// shared user row by google_id on the backend).
export async function googleLogin(idToken: string): Promise<StoredAuth> {
  // Attach a pending referral code (captured from ?ref=) so the referrer gets credited.
  let ref: string | null = null;
  try { ref = localStorage.getItem("cwRef"); } catch { /* ignore */ }
  const res = await fetch(`${BACKEND_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ref ? { idToken, ref } : { idToken }),
  });
  if (!res.ok) throw new Error(`Sign-in failed (${res.status})`);
  const data = (await res.json()) as StoredAuth; // { token, user }
  try { localStorage.removeItem("cwRef"); } catch { /* ignore */ }
  return data;
}

// Refresh the current user from the backend. 401 → token invalid/expired → null.
// Network hiccup → fall back to the cached user (don't sign out on a blip).
export async function getMe(token: string, cached?: AuthUser): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return null;
    if (!res.ok) return cached ?? null;
    const data = (await res.json()) as { user: AuthUser };
    return data.user;
  } catch {
    return cached ?? null;
  }
}

// Current session token (for authed admin calls).
export function getToken(): string | null {
  return getStoredAuth()?.token ?? null;
}

// Bearer fetch for admin writes. 401 → clear session + throw.
export async function authedFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const headers: Record<string, string> = {
    ...((opts.headers as Record<string, string>) || {}),
    Authorization: `Bearer ${token}`,
  };
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BACKEND_URL}${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearStoredAuth();
    throw new Error("Session expired");
  }
  return res;
}
