"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/api";
import { SmartLogo } from "@/components/common/smart-logo";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import {
  cleanDescription,
  formatCategories,
  getFreshnessLabel,
  getProductScore,
  isHardware,
  isValidWebsite,
  normalizeWebsite,
  resolveProductCountry,
} from "@/lib/product-utils";
import { useLocale } from "@/i18n";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

function formatScore(score: number, suffix: string): string {
  if (score <= 0) return suffix === "分" ? "待评" : "N/A";
  return Number.isInteger(score) ? `${score}${suffix}` : `${score.toFixed(1)}${suffix}`;
}

function scoreBadgeTone(score: number): string {
  if (score >= 5) return "product-badge--score-5";
  if (score >= 4) return "product-badge--score-4";
  if (score >= 3) return "product-badge--score-3";
  if (score >= 2) return "product-badge--rising";
  return "";
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { t } = useLocale();
  const router = useRouter();
  const website = normalizeWebsite(product.website);
  const hasWebsite = isValidWebsite(website);
  const detailId = encodeURIComponent(product._id || product.name);
  const detailHref = `/product/${detailId}`;
  const score = getProductScore(product);
  const scoreLabel = formatScore(score, t.common.pointsSuffix);
  const freshness = getFreshnessLabel(product);
  const country = resolveProductCountry(product);
  const regionMark = country.flag || "?";
  const description = cleanDescription(product.description);
  const tierClass = score >= 4 ? "product-card--darkhorse" : score >= 2 ? "product-card--rising" : "product-card--watch";
  const fundingLabel = product.funding_total || "";

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    router.push(detailHref);
  }

  return (
    <article
      className={`product-card product-card--signal product-card--dense ${tierClass}`}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(detailHref); }}
    >
      <div className="product-card__content">
        <div className="product-card__row-top">
          <SmartLogo
            key={`${product._id || product.name}-${product.logo_url || ""}-${product.logo || ""}-${product.website || ""}`}
            className="product-card__logo product-card__logo--sm"
            name={product.name}
            logoUrl={product.logo_url}
            secondaryLogoUrl={product.logo}
            website={product.website}
            sourceUrl={product.source_url}
            size={36}
          />
          <div className="product-card__identity-copy">
            <h3 className="product-card__title">{product.name}</h3>
            <p className="product-card__meta">{formatCategories(product)} · {regionMark} · {freshness}</p>
          </div>
          <span className={`product-badge product-badge--sm ${scoreBadgeTone(score)}`}>
            {scoreLabel}
          </span>
        </div>

        <p className="product-card__desc-dense">{description}</p>

        <div className="product-card__row-bottom">
          {fundingLabel ? <span className="product-card__funding-tag">{fundingLabel}</span> : null}
          <span className="product-card__type-tag">{isHardware(product) ? t.product.hw : t.product.sw}</span>
          <div className="product-card__actions-dense">
            <FavoriteButton product={product} />
            {hasWebsite ? (
              <a className="link-btn link-btn--card link-btn--xs" href={website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                {t.common.website}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
