import type { Metadata } from "next";
import AiClient from "@/components/AiClient";

export const metadata: Metadata = {
  title: "Ask CardWiz AI — which card should you use?",
  description:
    "CardWiz AI se poocho kaunsa credit/debit card use karna best hai kisi bhi purchase ke liye — instant, free card recommendations.",
  alternates: { canonical: "/ai" },
};

export default function AiPage() {
  return <AiClient />;
}
