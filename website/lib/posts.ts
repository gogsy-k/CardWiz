/*
 * Public news/blog fetch — mirrors lib/cards.ts (fail-soft: errors → []/null so a
 * backend hiccup never 500s the homepage; the news section just hides).
 */
import { BACKEND_URL } from "./api";

export type PostLang = "en" | "hinglish" | "hi";

export type Translation = { slug: string; title: string; lang: PostLang };

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
  lang: PostLang;
  translationGroup: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Maps our lang codes → BCP-47 hreflang values. Hinglish = romanized Hindi.
export const HREFLANG: Record<PostLang, string> = {
  en: "en",
  hinglish: "hi-Latn",
  hi: "hi",
};

export const LANG_LABEL: Record<PostLang, string> = {
  en: "English",
  hinglish: "Hinglish",
  hi: "हिन्दी",
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

export async function getPost(
  slug: string,
): Promise<{ post: Post; translations: Translation[] } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.post) return null;
    return { post: data.post as Post, translations: (data.translations ?? []) as Translation[] };
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
