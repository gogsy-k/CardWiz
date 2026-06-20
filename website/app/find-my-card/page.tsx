import type { Metadata } from "next";
import CardQuiz from "@/components/CardQuiz";

export const metadata: Metadata = {
  title: "Find My Card — 2-min quiz",
  description:
    "8 simple sawaal answer karo aur apne kharch ke hisaab se best credit card jaano. Privacy-first — aapke jawaab browser se bahar nahi jaate.",
  alternates: { canonical: "/find-my-card" },
};

export default function FindMyCardPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <CardQuiz />
    </div>
  );
}
