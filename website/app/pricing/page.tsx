import type { Metadata } from "next";
import PricingContent from "@/components/PricingContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "CardWiz plans — Free, Premium (₹49/mo · ₹399/yr) aur Pro (₹99/mo · ₹799/yr). Core features hamesha free. Privacy-first.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingContent />;
}
