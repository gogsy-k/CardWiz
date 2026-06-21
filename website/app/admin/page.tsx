"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGate from "@/components/AdminGate";
import AdminsManager from "@/components/admin/AdminsManager";
import { adminListPosts } from "@/lib/admin-api";
import { adminGetOffers, adminUpdateOffer, type Offer } from "@/lib/offers-api";
import { formatDate, type Post } from "@/lib/posts";

type Tab = "news" | "offers";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <AdminGate>
        <Dashboard />
      </AdminGate>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("news");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Admin</h1>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {(["news", "offers"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition-colors ${
              tab === t ? "bg-accent text-bg" : "border border-border hover:border-accent"
            }`}>
            {t === "news" ? "News" : "Offers Moderation"}
          </button>
        ))}
      </div>

      {tab === "news" ? <NewsTab /> : <OffersTab />}

      <AdminsManager />
    </div>
  );
}

function NewsTab() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminListPosts()
      .then(setPosts)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold">News Posts</h2>
        <Link href="/admin/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg transition-colors hover:bg-blue">
          + New post
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface2 p-2">
        {err && <p className="p-4 text-sm text-pink">{err}</p>}
        {!posts && !err && <p className="p-4 text-sm text-muted">Loading…</p>}
        {posts && posts.length === 0 && <p className="p-4 text-sm text-muted">No posts yet. Create one →</p>}
        {posts?.map((p) => (
          <Link key={p.id} href={`/admin/edit/${p.id}`}
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-surface">
            <div className="min-w-0">
              <div className="truncate font-semibold">{p.title || "(untitled)"}</div>
              <div className="text-xs text-muted">
                {formatDate(p.publishedAt || p.updatedAt)}
                {p.category && <> · {p.category}</>}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              p.status === "published" ? "bg-green/20 text-green" : "border border-border text-muted"
            }`}>
              {p.status === "published" ? "PUBLISHED" : "DRAFT"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function OffersTab() {
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    setOffers(null);
    setErr(null);
    adminGetOffers(filter)
      .then(setOffers)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(id: string, status: "approved" | "rejected") {
    setBusy(id);
    try {
      await adminUpdateOffer(id, status);
      setOffers((prev) => prev?.filter((o) => o.id !== id) ?? []);
    } catch {
      setErr("Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold">User Submitted Offers</h2>
        <div className="flex gap-1">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                filter === s ? "bg-accent text-bg" : "border border-border hover:border-accent"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-sm text-pink">{err}</p>}
      {!offers && !err && <p className="text-sm text-muted animate-pulse">Loading…</p>}
      {offers?.length === 0 && <p className="text-sm text-muted py-6 text-center">No {filter} offers.</p>}

      <div className="space-y-3">
        {offers?.map((o) => (
          <div key={o.id} className="rounded-xl border border-border bg-surface2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm">{o.title}</div>
                <div className="text-xs text-accent font-semibold mt-0.5">{o.discountText}</div>
                <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-muted">
                  <span>🏪 {o.merchant}</span>
                  {o.bank && <span>🏦 {o.bank}</span>}
                  {o.validUntil && <span>📅 Till {o.validUntil}</span>}
                  {o.submittedByEmail && <span>👤 {o.submittedByEmail}</span>}
                </div>
              </div>
              {filter === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => act(o.id, "approved")} disabled={busy === o.id}
                    className="rounded-lg bg-green/15 text-green px-3 py-1.5 text-xs font-bold hover:bg-green/30 disabled:opacity-50">
                    ✓ Approve
                  </button>
                  <button onClick={() => act(o.id, "rejected")} disabled={busy === o.id}
                    className="rounded-lg bg-pink/10 text-pink px-3 py-1.5 text-xs font-bold hover:bg-pink/20 disabled:opacity-50">
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
