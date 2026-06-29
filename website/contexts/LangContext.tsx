"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type LangCode, t as rawT } from "@/lib/site-i18n";

const LS_KEY = "cwSiteLang";

type LangCtx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  ready: boolean; // true once the saved language has hydrated from localStorage
};

const LangContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  ready: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  // First-time visitors default to English (also what crawlers see in SSR). Once the
  // user picks a language it's saved to localStorage and restored on every return visit.
  const [lang, setLangState] = useState<LangCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as LangCode | null;
    if (saved === "en" || saved === "hinglish" || saved === "hi") {
      setLangState(saved);
    }
    setReady(true);
  }, []);

  function setLang(l: LangCode) {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }

  const t = (key: string, vars?: Record<string, string | number>) =>
    rawT(lang, key, vars);

  return (
    <LangContext.Provider value={{ lang, setLang, t, ready }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
