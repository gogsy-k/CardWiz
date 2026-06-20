"use client";

import { useLang } from "@/contexts/LangContext";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/posts";

export default function NewsIndex({ posts }: { posts: Post[] }) {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl font-black sm:text-4xl">{t("news_title")}</h1>
      <p className="mt-2 text-subtle">{t("news_sub")}</p>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-muted">{t("news_empty")}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
