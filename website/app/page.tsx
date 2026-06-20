import { getCards } from "@/lib/cards";
import { getPosts } from "@/lib/posts";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const [cards, posts] = await Promise.all([getCards(), getPosts()]);
  const total = cards.length || 195;
  const credit = cards.filter((c) => c.cardType === "credit").length || 138;
  const banks = new Set(cards.map((c) => c.bank)).size || 50;

  return <HomeContent total={total} credit={credit} banks={banks} posts={posts.slice(0, 3)} />;
}
