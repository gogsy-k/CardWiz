import type { Metadata } from "next";
import OffersClient from "@/components/OffersClient";

export const metadata: Metadata = {
  title: "Bank offers & card discounts",
  description:
    "Latest credit/debit card bank offers — discounts, cashback deals aur limited-time promotions. Community-submitted, bank-wise filter karo. CardWiz pe free.",
  alternates: { canonical: "/offers" },
};

export default function OffersPage() {
  return <OffersClient />;
}
