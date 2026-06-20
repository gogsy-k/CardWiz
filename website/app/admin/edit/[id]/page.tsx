"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import AdminGate from "@/components/AdminGate";
import PostForm from "@/components/admin/PostForm";
import { adminGetPost } from "@/lib/admin-api";
import type { Post } from "@/lib/posts";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <AdminGate>
        <Link href="/admin" className="text-sm text-muted hover:text-subtle">
          ← Back to admin
        </Link>
        <EditLoader id={id} />
      </AdminGate>
    </div>
  );
}

function EditLoader({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null | undefined>(undefined); // undefined = loading
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminGetPost(id)
      .then(setPost)
      .catch((e) => {
        setErr(e instanceof Error ? e.message : "Not found");
        setPost(null);
      });
  }, [id]);

  if (post === undefined) return <p className="mt-6 text-sm text-muted">Loading…</p>;
  if (!post) return <p className="mt-6 text-sm text-pink">{err || "Post not found"}</p>;

  return (
    <>
      <h1 className="mb-6 mt-3 text-2xl font-black">Edit post</h1>
      <PostForm post={post} />
    </>
  );
}
