import type { Metadata } from "next";
import { getCards, topRate, cardCategories } from "@/lib/cards";
import CompareTool, { type CompareCard } from "@/components/CompareTool";

export const metadata: Metadata = {
  title: "Compare credit cards side-by-side",
  description:
    "Koi bhi 2-3 Indian credit/debit cards chuno aur reward rate, annual fee, network, categories ka live side-by-side comparison dekho — CardWiz pe free.",
  alternates: { canonical: "/compare" },
};

export default async function ComparePage() {
  const cards = await getCards();

  // Trim to display-ready fields only (keeps the client payload small — no raw rules).
  const trimmed: CompareCard[] = cards.map((c) => ({
    id: c.id,
    name: c.name,
    bank: c.bank,
    network: c.network,
    type: c.type,
    cardType: c.cardType,
    topRate: topRate(c),
    baseRate: c.baseRate,
    annualFee: c.annualFee ?? 0,
    feeWaiverSpend: c.feeWaiverSpend ?? 0,
    categories: cardCategories(c),
    fuelSurchargeWaiver: !!c.fuelSurchargeWaiver,
  }));

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-2xl font-black sm:text-3xl">Compare cards side-by-side</h1>
      <p className="mt-2 text-sm text-subtle">
        2-3 cards chuno — reward rate, fee, network aur categories ka live comparison.
      </p>
      <div className="mt-8">
        <CompareTool cards={trimmed} />
      </div>
    </div>
  );
}
