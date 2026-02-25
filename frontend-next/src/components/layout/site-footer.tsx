"use client";

import { Sparkles } from "lucide-react";
import { useLocale } from "@/i18n";

export function SiteFooter() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Sparkles size={14} />
        <span>WeeklyAI</span>
      </div>
      <div className="site-footer__meta">
        {locale === "zh"
          ? `© ${year} WeeklyAI · AI 驱动的全球产品发现`
          : `© ${year} WeeklyAI · AI-powered global product discovery`}
      </div>
    </footer>
  );
}
