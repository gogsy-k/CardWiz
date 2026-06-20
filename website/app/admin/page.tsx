"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGate from "@/components/AdminGate";
import AdminsManager from "@/components/admin/AdminsManager";
import { adminListPosts } from "@/lib/admin-api";
import { formatDate, type Post } from "@/lib/posts";

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
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminListPosts()
      .then(setPosts)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Admin · News</h1>
        <Link
          href="/admin/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg transition-colors hover:bg-blue"
        >
          + New post
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface2 p-2">
        {err && <p className="p-4 text-sm text-pink">{err}</p>}
        {!posts && !err && <p className="p-4 text-sm text-muted">Loading…</p>}
        {posts && posts.length === 0 && <p className="p-4 text-sm text-muted">No posts yet. Create one →</p>}
        {posts?.map((p) => (
          <Link
            key={p.id}
            href={`/admin/edit/${p.id}`}
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-surface"
          >
            <div className="min-w-0">
              <div className="truncate font-semibold">{p.title || "(untitled)"}</div>
              <div className="text-xs text-muted">
                {formatDate(p.publishedAt || p.updatedAt)}
                {p.category && <> · {p.category}</>}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                p.status === "published" ? "bg-green/20 text-green" : "border border-border text-muted"
              }`}
            >
              {p.status === "published" ? "PUBLISHED" : "DRAFT"}
            </span>
          </Link>
        ))}
      </div>

      <AdminsManager />
    </div>
  );
}
