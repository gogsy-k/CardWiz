import type { MetadataRoute } from "next";
import { getCards } from "@/lib/cards";
import { getPosts } from "@/lib/posts";
import { BEST_CARD_CATEGORIES } from "@/lib/best-cards";

const BASE = "https://cardwiz.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    "", "/cards", "/find-my-card", "/ai", "/offers", "/news",
    "/pricing", "/contact", "/privacy", "/terms", "/refunds", "/shipping",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const bestCardRoutes = BEST_CARD_CATEGORIES.map((c) => ({
    url: `${BASE}/best-card-for/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Card + post pages — backend slow/down ho to gracefully skip.
  let cardRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const cards = await getCards();
    cardRoutes = cards.map((c) => ({
      url: `${BASE}/cards/${c.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch { /* skip */ }
  try {
    const posts = await getPosts();
    postRoutes = posts.map((p) => ({
      url: `${BASE}/news/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch { /* skip */ }

  return [...staticRoutes, ...bestCardRoutes, ...cardRoutes, ...postRoutes];
}
