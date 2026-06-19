import { getCards } from "@/lib/cards";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const cards = await getCards();
  const total = cards.length || 195;
  const credit = cards.filter((c) => c.cardType === "credit").length || 138;
  const banks = new Set(cards.map((c) => c.bank)).size || 50;

  return <HomeContent total={total} credit={credit} banks={banks} />;
}
