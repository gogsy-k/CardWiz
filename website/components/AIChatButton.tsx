"use client";

import Link from "next/link";

export default function AIChatButton() {
  return (
    <Link
      href="/ai"
      title="CardWiz AI — card ke baare mein kuch bhi pucho"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg hover:scale-105 transition-transform"
      aria-label="Open AI chat"
    >
      <span className="text-2xl">🤖</span>
    </Link>
  );
}
