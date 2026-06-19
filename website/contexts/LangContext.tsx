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
};

const LangContext = createContext<LangCtx>({
  lang: "hinglish",
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("hinglish");

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as LangCode | null;
    if (saved === "en" || saved === "hinglish" || saved === "hi") {
      setLangState(saved);
    }
  }, []);

  function setLang(l: LangCode) {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }

  const t = (key: string, vars?: Record<string, string | number>) =>
    rawT(lang, key, vars);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
