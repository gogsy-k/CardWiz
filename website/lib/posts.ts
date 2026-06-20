/*
 * Public news/blog fetch — mirrors lib/cards.ts (fail-soft: errors → []/null so a
 * backend hiccup never 500s the homepage; the news section just hides).
 */
import { BACKEND_URL } from "./api";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  content: string; // markdown
  category: string;
  authorName: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/posts`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const posts: Post[] = data.posts ?? data ?? [];
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.post ?? null) as Post | null;
  } catch {
    return null;
  }
}

// Display helpers
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}
