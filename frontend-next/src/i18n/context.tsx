"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import zh, { type Locale } from "./locales/zh";
import en from "./locales/en";

export type LocaleCode = "zh" | "en";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: Locale;
};

const STORAGE_KEY = "weeklyai_locale";

const localeMap: Record<LocaleCode, Locale> = { zh, en };

function detectInitialLocale(): LocaleCode {
  if (typeof window === "undefined") return "zh";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {
    /* SSR or blocked storage */
  }
  const browserLang = navigator.language?.toLowerCase() ?? "";
  if (browserLang.startsWith("zh")) return "zh";
  return "en";
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "zh",
  setLocale: () => {},
  t: zh,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* blocked */
    }
    document.documentElement.lang = code === "zh" ? "zh-CN" : "en";
  }, []);

  const t = localeMap[locale];

  if (!mounted) {
    return (
      <LocaleContext value={{ locale: "zh", setLocale, t: zh }}>
        {children}
      </LocaleContext>
    );
  }

  return (
    <LocaleContext value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext>
  );
}
