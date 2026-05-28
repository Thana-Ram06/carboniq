"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { translations, type Language } from "@/lib/i18n/translations";

type TranslationSet = (typeof translations)[Language];

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: TranslationSet;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("vasudha_lang") as Language) ?? "en";
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("vasudha_lang", l);
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
