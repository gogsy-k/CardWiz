"use client";

import Link from "next/link";
import AdminGate from "@/components/AdminGate";
import PostForm from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <AdminGate>
        <Link href="/admin" className="text-sm text-muted hover:text-subtle">
          ← Back to admin
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-black">New post</h1>
        <PostForm />
      </AdminGate>
    </div>
  );
}
