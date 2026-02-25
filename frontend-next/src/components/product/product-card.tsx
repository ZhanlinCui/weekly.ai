"use client";

import Link from "next/link";
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
  const website = normalizeWebsite(product.website);
  const hasWebsite = isValidWebsite(website);
  const detailId = encodeURIComponent(product._id || product.name);
  const score = getProductScore(product);
  const scoreLabel = formatScore(score, t.common.pointsSuffix);
  const freshness = getFreshnessLabel(product);
  const country = resolveProductCountry(product);
  const regionLabel = country.unknown ? "Unknown" : country.name;
  const regionMark = country.flag;
  const hasRegionText = true;
  const microlineParts = [freshness, product.source || t.common.sourcePending];
  const description = cleanDescription(product.description);
  const whyMatters = product.why_matters?.trim();
  const tierClass = score >= 4 ? "product-card--darkhorse" : score >= 2 ? "product-card--rising" : "product-card--watch";
  const secondaryBadge = product.funding_total || (isHardware(product) ? t.product.hw : t.product.sw);

  return (
    <article className={`product-card product-card--signal ${tierClass} ${compact ? "product-card--compact" : ""}`}>
      <div className="product-card__content">
        <div className="product-card__topline">
          <span className="product-card__region-pill" aria-label={t.product.regionTooltip(regionLabel)} title={t.product.regionTooltip(regionLabel)}>
            {regionMark ? (
              <span className="product-card__region-flag" aria-hidden="true">
                {regionMark}
              </span>
            ) : null}
            {hasRegionText ? <span className="product-card__region-text">{regionLabel}</span> : null}
          </span>
          <p className="product-card__microline">{microlineParts.join(" · ")}</p>
        </div>

        <header className="product-card__header">
          <div className="product-card__identity">
            <SmartLogo
              key={`${product._id || product.name}-${product.logo_url || ""}-${product.logo || ""}-${product.website || ""}-${product.source_url || ""}`}
              className="product-card__logo"
              name={product.name}
              logoUrl={product.logo_url}
              secondaryLogoUrl={product.logo}
              website={product.website}
              sourceUrl={product.source_url}
              size={compact ? 44 : 48}
            />
            <div className="product-card__identity-copy">
              <h3 className="product-card__title">{product.name}</h3>
              <p className="product-card__meta">{formatCategories(product)}</p>
            </div>
          </div>

          <div className="product-card__badges">
            <span className={`product-badge ${scoreBadgeTone(score)}`}>
              {score >= 4 ? t.product.darkHorseLabel(scoreLabel) : score >= 2 ? t.product.risingLabel(scoreLabel) : scoreLabel}
            </span>
            <span className="product-badge">{secondaryBadge}</span>
          </div>
        </header>

        <div className="product-card__summary">
          <p className="product-card__summary-text">{description}</p>
          {!compact && whyMatters ? (
            <p className="product-card__summary-why">
              <span className="product-card__summary-why-label">WHY</span>
              {whyMatters}
            </p>
          ) : null}
        </div>

        <footer className="product-card__footer">
          <FavoriteButton product={product} />
          <Link href={`/product/${detailId}`} className="link-btn link-btn--card link-btn--card-primary">
            {t.common.details}
          </Link>
          {hasWebsite ? (
            <a className="link-btn link-btn--card" href={website} target="_blank" rel="noopener noreferrer">
              {t.common.website}
            </a>
          ) : (
            <span className="pending-tag">{t.common.websitePending}</span>
          )}
        </footer>
      </div>
    </article>
  );
}
