"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Must handle loading separately — collapsing with !user would redirect
  // authenticated users whose session is still resolving.
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-border border-t-accent" />
      </div>
    );
  }

  if (!user) {
    const reasons = [
      { icon: "☁️", title: "Cloud Sync", desc: "Tumhare cards har device pe — automatically synced." },
      { icon: "📊", title: "Savings History", desc: "Missed Savings report + transaction tracking, har mahine." },
      { icon: "🔔", title: "Smart Alerts", desc: "Bill reminders + offer watchlist — kabhi deal miss na ho." },
    ];
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-5 py-12 text-center">
        <div className="text-5xl">🔐</div>
        <div>
          <h1 className="text-xl font-black">Apna CardWiz account banao</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted leading-relaxed">
            Free Google sign-in. Hum sirf naam &amp; email lete hain — card number ya CVV kabhi nahi.
          </p>
        </div>
        <div className="w-full space-y-3 text-left">
          {reasons.map((r) => (
            <div key={r.title} className="flex items-start gap-3 rounded-xl border border-border bg-surface2 p-4">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <div className="text-sm font-bold">{r.title}</div>
                <div className="text-xs text-muted leading-relaxed">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <GoogleSignIn />
      </div>
    );
  }

  return <>{children}</>;
}
