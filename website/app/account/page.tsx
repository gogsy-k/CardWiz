"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import PortfolioScoreWidget from "@/components/PortfolioScoreWidget";

const LIVE_FEATURES = [
  {
    emoji: "📋",
    title: "My Transactions",
    desc: "Log your spends to power the Missed Savings analysis.",
    href: "/account/transactions",
  },
];

const COMING_SOON = [
  {
    emoji: "💸",
    title: "Missed Savings Report",
    desc: "Find out exactly how much you left on the table last month by using the wrong card.",
    premium: true,
  },
  {
    emoji: "📄",
    title: "Statement Upload",
    desc: "Upload a PDF bank statement — we extract spend data automatically (raw PDF never stored).",
    premium: true,
  },
  {
    emoji: "⭐",
    title: "Card Reviews",
    desc: "Rate and review cards you actually own. Your reviews help other CardWiz users pick better.",
  },
  {
    emoji: "📧",
    title: "Monthly Report Email",
    desc: "Opt-in monthly email: total saved, best card, worst card, and missed savings last month.",
    premium: true,
  },
];

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null; // layout handles the auth guard

  const isPremium = user.plan === "premium";
  const initial = (user.name || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-10">

      {/* ── Profile card ── */}
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-surface2 p-6">
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            width={64}
            height={64}
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-full"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-black text-bg">
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-black">{user.name}</div>
          <div className="truncate text-sm text-muted">{user.email}</div>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              isPremium
                ? "bg-accent text-bg"
                : "border border-border text-subtle"
            }`}
          >
            {isPremium ? "✨ Premium" : "Free plan"}
          </span>
        </div>

        {!isPremium && (
          <Link
            href="/pricing"
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg transition-colors hover:bg-blue"
          >
            Upgrade →
          </Link>
        )}
      </div>

      {/* ── Portfolio Score ── */}
      <PortfolioScoreWidget isPremium={isPremium} />

      {/* ── Upgrade banner for free users ── */}
      {!isPremium && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
          <div className="mb-2 text-3xl">💎</div>
          <div className="mb-1 text-base font-bold">Unlock CardWiz Premium</div>
          <p className="mx-auto mb-5 max-w-md text-sm text-muted leading-relaxed">
            Missed Savings Report, Portfolio Score, Statement Upload, Manual Transactions
            and more — starting at just ₹49/month.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-bg transition-colors hover:bg-blue"
          >
            See all plans →
          </Link>
        </div>
      )}

      {/* ── Live account features ── */}
      <div>
        <h2 className="mb-4 text-lg font-black">Account features</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LIVE_FEATURES.map((f) => (
            <a
              key={f.title}
              href={f.href}
              className="flex gap-3 rounded-xl border border-border bg-surface2 p-4 transition-colors hover:border-accent"
            >
              <span className="mt-0.5 text-2xl leading-none">{f.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {f.title}
                  <span className="rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-bold text-green">Live</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{f.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Coming soon features ── */}
      <div>
        <h2 className="mb-1 text-lg font-black">Coming soon</h2>
        <p className="mb-5 text-sm text-muted">These features are being built — check back soon.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMING_SOON.map((f) => (
            <div
              key={f.title}
              className="flex gap-3 rounded-xl border border-border bg-surface2 p-4"
            >
              <span className="mt-0.5 text-2xl leading-none">{f.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {f.title}
                  {f.premium ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                      Premium
                    </span>
                  ) : (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold text-muted">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
