"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { searchProductsClient } from "@/lib/api-client";
import type { SearchParams } from "@/types/api";
import { ProductCard } from "@/components/product/product-card";
import { useLocale } from "@/i18n";

const SEARCH_DEBOUNCE_MS = 360;

type SearchClientProps = {
  initialQuery?: string;
};

export function SearchClient({ initialQuery = "" }: SearchClientProps) {
  const { t } = useLocale();
  const seedQuery = initialQuery.trim();
  const [q, setQ] = useState(seedQuery);
  const [submittedQ, setSubmittedQ] = useState(seedQuery);
  const [type, setType] = useState<SearchParams["type"]>("all");
  const [page, setPage] = useState(1);

  const params = useMemo<SearchParams>(
    () => ({
      q: submittedQ,
      categories: [],
      type,
      sort: "trending",
      page,
      limit: 20,
    }),
    [page, submittedQ, type]
  );

  const shouldSearch = submittedQ.trim().length > 0;
  const isDebouncing = q.trim() !== submittedQ;

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    shouldSearch ? ["search", params] : null,
    ([, payload]) => searchProductsClient(payload),
    { dedupingInterval: 20_000, revalidateOnFocus: false, keepPreviousData: true }
  );

  useEffect(() => {
    const next = q.trim();
    if (next === submittedQ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPage(1);
      setSubmittedQ(next);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [q, submittedQ]);

  function commitQuery(nextValue: string) {
    const normalized = nextValue.trim();
    setPage(1);
    setSubmittedQ(normalized);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitQuery(q);
  }

  function resetTypeFilter() {
    setType("all");
    setPage(1);
  }

  function clearSearch() {
    setQ("");
    commitQuery("");
  }

  function resetAll() {
    setQ("");
    setSubmittedQ("");
    setType("all");
    setPage(1);
  }

  function updateType(nextType: SearchParams["type"]) {
    setType(nextType);
    setPage(1);
  }

  const resultCount = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.pages ?? 0;
  const currentPage = data?.pagination?.page ?? page;
  const hasResults = (data?.data.length ?? 0) > 0;
  const hasTypeFilter = type !== "all";
  const statusText = isLoading ? t.search.searching : isValidating ? t.search.updating : isDebouncing ? t.search.typing : "";
  const errorMessage = error instanceof Error ? error.message : String(error || t.search.failed);

  return (
    <section className="section search-page">
      <div className="section-header">
        <h1 className="section-title">{t.search.title}</h1>
        <p className="section-desc">{t.search.subtitle}</p>
        <p className="section-micro-note">{t.search.note}</p>
      </div>

      <form className="search-panel" onSubmit={onSubmit}>
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={t.search.placeholder}
          aria-label={t.search.ariaLabel}
          autoComplete="off"
        />
        <div className="search-panel__actions">
          <button type="button" onClick={clearSearch} disabled={!q.trim() && !submittedQ}>
            {t.search.clearBtn}
          </button>
          <button type="submit">{t.search.searchBtn}</button>
        </div>
      </form>

      <div className="search-toolbar search-toolbar--minimal">
        <label className="search-toolbar__item">
          {t.search.typeLabel}
          <select value={type} onChange={(event) => updateType(event.target.value as SearchParams["type"])}>
            <option value="all">{t.common.all}</option>
            <option value="software">{t.common.software}</option>
            <option value="hardware">{t.common.hardware}</option>
          </select>
        </label>
        <button
          type="button"
          className="link-btn search-toolbar__reset"
          onClick={resetTypeFilter}
          disabled={!hasTypeFilter}
        >
          {t.search.resetType}
        </button>
      </div>

      {isLoading && !hasResults ? <div className="loading-block">{t.search.searching}</div> : null}
      {error ? (
        <div className="error-block">
          {t.search.failedMessage(errorMessage)}
          <button type="button" className="link-btn" onClick={() => mutate()}>
            {t.common.retry}
          </button>
        </div>
      ) : null}

      {shouldSearch && !error ? (
        <p className="search-result-meta">
          {t.search.results(resultCount, hasTypeFilter ? (type === "software" ? t.common.software : t.common.hardware) : undefined)}
          {statusText ? ` · ${statusText}` : ""}
        </p>
      ) : null}

      {hasResults ? (
        <div className="products-grid search-results-grid">
          {data?.data.map((product) => (
            <ProductCard key={product._id || product.name} product={product} />
          ))}
        </div>
      ) : null}

      {data?.pagination && totalPages > 1 ? (
        <div className="pagination">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading || isValidating}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            {t.search.prevPage}
          </button>
          <span>{t.search.pageInfo(currentPage, totalPages)}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading || isValidating}
            onClick={() => setPage((value) => value + 1)}
          >
            {t.search.nextPage}
          </button>
        </div>
      ) : null}

      {!shouldSearch ? (
        <div className="empty-state">
          <p className="empty-state-text">{t.search.startSearch}</p>
        </div>
      ) : null}

      {shouldSearch && !isLoading && !isValidating && !error && !hasResults ? (
        <div className="empty-state">
          <p className="empty-state-text">{t.search.noResults}</p>
          <button type="button" className="link-btn" onClick={resetAll}>
            {t.search.clearAndRetry}
          </button>
        </div>
      ) : null}
    </section>
  );
}
