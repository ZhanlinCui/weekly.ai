"use client";

import Link from "next/link";
import { useLocale } from "@/i18n";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <section className="section">
      <div className="section-header">
        <h1 className="section-title">{t.notFound.title}</h1>
        <p className="section-desc">{t.notFound.description}</p>
      </div>
      <Link href="/" className="link-btn link-btn--primary">
        {t.notFound.backHome}
      </Link>
    </section>
  );
}
