import type { Metadata } from "next";
import { getCards } from "@/lib/cards";
import CardFinder from "@/components/CardFinder";

export const metadata: Metadata = {
  title: "Find the best card — 195+ Indian credit & debit cards",
  description:
    "Browse aur compare karo India ke 195+ credit & debit cards — reward rate, annual fee, cashback/points/miles, aur category ke hisaab se. CardWiz pe free.",
};

export default async function CardsPage() {
  const cards = await getCards();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Find your best card</h1>
      <p className="mt-2 max-w-2xl text-subtle">
        India ke {cards.length || "195+"} credit & debit cards ek jagah — reward rate, fee aur
        category ke hisaab se compare karo. Kisi card pe click karke poori detail dekho.
      </p>

      <div className="mt-8">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
            Cards abhi load nahi ho paaye — backend thodi der mein wake hoga (free tier).
            <br />
            Page refresh karke dekho.
          </div>
        ) : (
          <CardFinder cards={cards} />
        )}
      </div>
    </div>
  );
}
