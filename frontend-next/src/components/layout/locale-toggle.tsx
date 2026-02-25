"use client";

import { Globe } from "lucide-react";
import { useLocale } from "@/i18n";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      className="locale-toggle"
      type="button"
      onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
      aria-label={locale === "zh" ? "Switch to English" : "切换为中文"}
      title={locale === "zh" ? "Switch to English" : "切换为中文"}
    >
      <Globe size={16} />
      <span>{locale === "zh" ? "EN" : "中"}</span>
    </button>
  );
}
