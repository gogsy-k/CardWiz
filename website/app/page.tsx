import { getCards, type Card } from "@/lib/cards";
import { getPosts } from "@/lib/posts";
import HomeContent from "@/components/HomeContent";

// Popular cards powering the homepage Savings Calculator (kept small — not all 195).
const CALC_CARD_IDS = [
  "amazon-pay-icici",
  "flipkart-axis",
  "hdfc-millennia",
  "sbi-cashback",
  "axis-ace",
  "icici-coral",
  "hdfc-infinia",
  "axis-magnus",
];

export default async function Home() {
  const [cards, posts] = await Promise.all([getCards(), getPosts()]);
  const total = cards.length || 195;
  const credit = cards.filter((c) => c.cardType === "credit").length || 138;
  const banks = new Set(cards.map((c) => c.bank)).size || 50;

  // Curated calculator cards — defensive: drop missing ids, warn in dev.
  const byId = new Map(cards.map((c) => [c.id, c]));
  const calcCards = CALC_CARD_IDS.map((id) => {
    const c = byId.get(id);
    if (!c && process.env.NODE_ENV !== "production") {
      console.warn(`[SavingsCalculator] curated card id not found in catalog: ${id}`);
    }
    return c;
  }).filter((c): c is Card => Boolean(c));

  return (
    <HomeContent
      total={total}
      credit={credit}
      banks={banks}
      posts={posts.slice(0, 15)}
      calcCards={calcCards}
    />
  );
}
