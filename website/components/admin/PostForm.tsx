"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import { adminCreatePost, adminUpdatePost, adminDeletePost, type AdminPostInput } from "@/lib/admin-api";
import { cloudinaryEnabled, uploadImage } from "@/lib/cloudinary";
import type { Post } from "@/lib/posts";

const inputCls =
  "w-full rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-sm text-fg outline-none focus:border-accent";

export default function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const editing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [busy, setBusy] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(status: "draft" | "published") {
    setErr(null);
    if (!title.trim() || !content.trim()) {
      setErr("Title and content are required.");
      return;
    }
    setBusy(true);
    const input: AdminPostInput = { title, excerpt, category, coverImage, content, status };
    try {
      if (editing) await adminUpdatePost(post.id, input);
      else await adminCreatePost(input);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setBusy(false);
    }
  }

  async function del() {
    if (!editing) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this post permanently?")) return;
    setBusy(true);
    try {
      await adminDeletePost(post.id);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    setErr(null);
    try {
      setCoverImage(await uploadImage(file));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed");
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-subtle">Title</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-subtle">Category</label>
          <input
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Credit Cards, Finance"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-subtle">Cover image URL</label>
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
            />
            {cloudinaryEnabled && (
              <label className="shrink-0 cursor-pointer rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-accent hover:border-accent">
                {coverUploading ? "…" : "📤"}
                <input type="file" accept="image/*" hidden onChange={onCoverFile} />
              </label>
            )}
          </div>
        </div>
      </div>

      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt="" loading="lazy" className="max-h-48 rounded-xl border border-border object-cover" />
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold text-subtle">Excerpt (short summary)</label>
        <textarea
          className={inputCls}
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="One or two lines shown in the news list."
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-subtle">Content</label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      {err && <p className="text-sm text-pink">{err}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          onClick={() => save("published")}
          disabled={busy}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-bg transition-colors hover:bg-blue disabled:opacity-50"
        >
          {editing ? "Update & Publish" : "Publish"}
        </button>
        <button
          onClick={() => save("draft")}
          disabled={busy}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-subtle transition-colors hover:text-fg disabled:opacity-50"
        >
          Save draft
        </button>
        {editing && (
          <button
            onClick={del}
            disabled={busy}
            className="ml-auto rounded-xl border border-pink/40 px-4 py-2.5 text-sm font-semibold text-pink transition-colors hover:border-pink disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
