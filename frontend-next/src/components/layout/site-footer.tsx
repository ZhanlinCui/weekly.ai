"use client";

import Image from "next/image";
import { useLocale } from "@/i18n";

export function SiteFooter() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Image src="/logo.png" alt="WAI" width={18} height={18} />
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
