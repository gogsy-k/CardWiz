"use client";

import { useLang } from "@/contexts/LangContext";

/**
 * Localizes a single string inside a Server Component. Server pages can't use the
 * client `useLang()` hook directly, so drop a <T k="key" /> where prose is needed.
 * SSR renders the default locale (hinglish); hydration switches to the user's choice.
 */
export default function T({
  k,
  vars,
}: {
  k: string;
  vars?: Record<string, string | number>;
}) {
  const { t } = useLang();
  return <>{t(k, vars)}</>;
}
