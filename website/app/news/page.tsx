import type { Metadata } from "next";
import { getPosts } from "@/lib/posts";
import NewsIndex from "@/components/NewsIndex";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Latest credit card and personal finance news, tips and updates from CardWiz — India-first.",
  alternates: { canonical: "/news" },
};

export const revalidate = 300;

export default async function NewsPage() {
  const posts = await getPosts();
  return <NewsIndex posts={posts} />;
}
