"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Dice5, Heart, Flame, Newspaper, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { countFavorites, openFavoritesPanel, subscribeFavorites } from "@/lib/favorites";
import { useLocale } from "@/i18n";
import { LocaleToggle } from "./locale-toggle";

const ThemeToggle = dynamic(() => import("@/components/layout/theme-toggle").then((mod) => mod.ThemeToggle), {
  ssr: false,
});

const navIcons = [Flame, Dice5, Newspaper, Search] as const;
const navHrefs = ["/", "/discover", "/blog", "/search"] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const sync = () => setFavoritesCount(countFavorites());
    sync();
    return subscribeFavorites(sync);
  }, []);

  const navLabels = [t.nav.darkHorses, t.nav.discover, t.nav.blog, t.nav.search];

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" aria-label={t.nav.home}>
          <span className="logo-icon">
            <Sparkles size={18} />
          </span>
          <span className="logo-text">WeeklyAI</span>
        </Link>

        <nav className="nav-links" aria-label={t.nav.mainNav}>
          {navHrefs.map((href, i) => {
            const Icon = navIcons[i];
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={`nav-link ${isActive ? "active" : ""}`}>
                <span className="nav-icon">
                  <Icon size={16} />
                </span>
                {navLabels[i]}
              </Link>
            );
          })}
        </nav>

        <div className="nav-actions">
          <button className="nav-favorites" type="button" onClick={() => openFavoritesPanel("product")} aria-label={t.common.openFavorites}>
            <Heart size={16} />
            <span>{t.nav.favoritesWithCount(favoritesCount)}</span>
          </button>
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
