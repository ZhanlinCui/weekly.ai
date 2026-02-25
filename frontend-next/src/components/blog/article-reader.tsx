"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { useLocale } from "@/i18n";

type ArticleData = {
  success: boolean;
  title?: string;
  content?: string;
  url?: string;
  source?: string;
  error?: string;
};

type ArticleReaderProps = {
  url: string;
  blogTitle: string;
  onClose: () => void;
};

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1")
    : "http://localhost:5000/api/v1";

export function ArticleReader({ url, blogTitle, onClose }: ArticleReaderProps) {
  const { locale } = useLocale();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/products/reader?url=${encodeURIComponent(url)}`);
      const data = await resp.json();
      setArticle(data);
    } catch {
      setArticle({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const failedLabel = locale === "zh" ? "无法加载文章内容，点击下方按钮访问原文。" : "Could not load article. Click below to visit the source.";
  const loadingLabel = locale === "zh" ? "正在加载文章..." : "Loading article...";
  const openOriginal = locale === "zh" ? "打开原文" : "Open original";

  return (
    <div className="reader-overlay">
      <div className="reader-overlay__backdrop" onClick={onClose} />
      <div className="reader-panel" ref={panelRef}>
        <header className="reader-panel__header">
          <h2 className="reader-panel__title">{article?.title || blogTitle}</h2>
          <button type="button" className="reader-panel__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="reader-panel__body">
          {loading ? (
            <div className="reader-loading">
              <div className="reader-loading__bar" />
              <p>{loadingLabel}</p>
            </div>
          ) : article?.success && article.content ? (
            <div className="reader-content">
              {article.content.split("\n").map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <br key={i} />;
                if (trimmed.startsWith("## "))
                  return <h3 key={i} className="reader-content__h">{trimmed.slice(3)}</h3>;
                if (trimmed.startsWith("> "))
                  return <blockquote key={i} className="reader-content__quote">{trimmed.slice(2)}</blockquote>;
                if (trimmed.startsWith("- "))
                  return <p key={i} className="reader-content__li">• {trimmed.slice(2)}</p>;
                return <p key={i}>{trimmed}</p>;
              })}
            </div>
          ) : (
            <div className="reader-error">
              <p>{failedLabel}</p>
            </div>
          )}
        </div>

        <footer className="reader-panel__footer">
          <a href={url} target="_blank" rel="noopener noreferrer" className="reader-panel__original">
            <ExternalLink size={14} />
            {openOriginal}
          </a>
        </footer>
      </div>
    </div>
  );
}
