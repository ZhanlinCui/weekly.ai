"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Dice5, Home } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/types/api";
import { addProductFavorite, countFavorites, openFavoritesPanel, subscribeFavorites } from "@/lib/favorites";
import { useLocale } from "@/i18n";

const DiscoveryDeck = dynamic(() => import("@/components/home/discovery-deck"), {
  ssr: false,
  loading: () => <div className="swipe-card is-active">...</div>,
});

type DiscoverClientProps = {
  products: Product[];
};

export function DiscoverClient({ products }: DiscoverClientProps) {
  const { t } = useLocale();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const sync = () => setFavoritesCount(countFavorites());
    sync();
    return subscribeFavorites(sync);
  }, []);

  function addFavorite(product: Product) {
    if (addProductFavorite(product)) {
      setFavoritesCount(countFavorites());
    }
  }

  return (
    <section className="section discover-page">
      <div className="section-header">
        <h1 className="section-title">
          <span className="title-icon">
            <Dice5 size={18} />
          </span>
          {t.discover.title}
        </h1>
        <p className="section-desc">{t.discover.subtitle}</p>
        <p className="section-micro-note">{t.discover.gestureNote}</p>
      </div>

      <div className="list-controls discover-page__controls">
        <button className="favorites-toggle" type="button" aria-label={t.common.openFavorites} onClick={() => openFavoritesPanel("product")}>
          ❤️ {favoritesCount}
        </button>
        <Link className="link-btn" href="/">
          <Home size={14} /> {t.common.backToHome}
        </Link>
      </div>

      {products.length ? (
        <DiscoveryDeck key={`discover-${products.length}`} products={products} onLike={addFavorite} />
      ) : (
        <div className="empty-state">
          <p className="empty-state-text">{t.discover.noProducts}</p>
        </div>
      )}
    </section>
  );
}
