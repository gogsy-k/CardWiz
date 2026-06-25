"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { getRewards, type RewardsResponse } from "@/lib/rewards-api";

const EARN = [
  { icon: "⭐", key: "rw_earn_review", reason: "review", href: "/cards" },
  { icon: "🧾", key: "rw_earn_txn", reason: "transaction", href: "/account/transactions" },
  { icon: "🏷️", key: "rw_earn_offer", reason: "offer", href: "/offers" },
] as const;

export default function RewardsPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRewards()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null; // layout handles the auth guard

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-10">
      {/* Header */}
      <div>
        <Link href="/account" className="text-xs text-muted hover:text-subtle">← Account</Link>
        <h1 className="mt-1 text-2xl font-black">🪙 {t("rw_h")}</h1>
        <p className="mt-0.5 text-sm text-muted">{t("rw_sub")}</p>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-surface2 p-6 text-center">
        <div className="text-5xl font-black tabular-nums text-accent [text-shadow:0_0_24px_rgba(99,102,241,0.4)]">
          {loading ? "…" : (data?.points ?? 0).toLocaleString("en-IN")}
        </div>
        <div className="mt-1 text-xs font-bold uppercase tracking-wide text-subtle">{t("rw_points")}</div>
        <div className="mt-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-muted">
          {t("rw_redeem_soon")}
        </div>
      </div>

      {/* How to earn */}
      <div>
        <h2 className="mb-3 text-lg font-black">{t("rw_earn_h")}</h2>
        <div className="space-y-2.5">
          {EARN.map((e) => (
            <Link
              key={e.reason}
              href={e.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface2 p-4 transition-colors hover:border-accent"
            >
              <span className="text-2xl">{e.icon}</span>
              <span className="flex-1 text-sm font-semibold">{t(e.key)}</span>
              <span className="shrink-0 rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-green">
                {t("rw_pts", { n: data?.earnRates?.[e.reason] ?? 0 })}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{t("rw_earn_more")}</p>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-3 text-lg font-black">{t("rw_activity_h")}</h2>
        {loading ? (
          <div className="animate-pulse py-8 text-center text-sm text-muted">…</div>
        ) : !data || data.history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted">
            {t("rw_empty")}
          </p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface2">
            {data.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{t(`rw_reason_${h.reason}`)}</div>
                  <div className="text-xs text-muted">
                    {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className={`shrink-0 text-sm font-black tabular-nums ${h.delta >= 0 ? "text-green" : "text-red-400"}`}>
                  {h.delta >= 0 ? "+" : ""}
                  {h.delta}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
