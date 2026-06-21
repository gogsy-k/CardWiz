"use client";

import { usePathname } from "next/navigation";
import AIChatButton from "./AIChatButton";

// Renders the floating chat button everywhere except on the /ai page itself.
export default function ConditionalAIButton() {
  const pathname = usePathname();
  if (pathname === "/ai") return null;
  return <AIChatButton />;
}
