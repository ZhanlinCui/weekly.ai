"""
Reader Service — Fetch and clean article content for in-app reading.

Uses r.jina.ai reader API for clean markdown extraction,
with fallback to raw HTML parsing via BeautifulSoup.
"""

import os
import re
import hashlib
import time
import requests
from typing import Optional

_cache: dict[str, tuple[float, dict]] = {}
CACHE_TTL = 3600  # 1 hour
MAX_CONTENT_LENGTH = 15000  # chars


def fetch_article(url: str) -> dict:
    """Fetch article content in reader-friendly format."""
    if not url or not url.startswith(("http://", "https://")):
        return {"success": False, "error": "Invalid URL"}

    cache_key = hashlib.md5(url.encode()).hexdigest()
    cached = _cache.get(cache_key)
    if cached and (time.time() - cached[0]) < CACHE_TTL:
        return cached[1]

    result = _fetch_via_jina(url)
    if not result:
        result = _fetch_via_direct(url)

    if result:
        data = {"success": True, **result}
    else:
        data = {"success": False, "error": "Failed to fetch article"}

    _cache[cache_key] = (time.time(), data)
    return data


def _fetch_via_jina(url: str) -> Optional[dict]:
    """Use r.jina.ai for clean markdown extraction."""
    try:
        resp = requests.get(
            f"https://r.jina.ai/{url}",
            headers={
                "Accept": "application/json",
                "X-Return-Format": "markdown",
            },
            timeout=12,
        )
        if resp.status_code != 200:
            return None

        data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else None
        if data and data.get("data"):
            content = data["data"].get("content", "") or data["data"].get("text", "")
            title = data["data"].get("title", "")
        else:
            content = resp.text
            title = ""

        content = _truncate(content)
        if len(content) < 50:
            return None

        return {
            "title": title,
            "content": content,
            "url": url,
            "source": "jina",
        }
    except Exception:
        return None


def _fetch_via_direct(url: str) -> Optional[dict]:
    """Fallback: fetch HTML and extract main text."""
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 WeeklyAI Reader/1.0"},
            timeout=10,
            allow_redirects=True,
        )
        if resp.status_code != 200:
            return None

        html = resp.text[:200000]
        title, content = _extract_from_html(html)
        content = _truncate(content)

        if len(content) < 80:
            return None

        return {
            "title": title,
            "content": content,
            "url": url,
            "source": "direct",
        }
    except Exception:
        return None


def _extract_from_html(html: str) -> tuple[str, str]:
    """Extract title and main content from HTML."""
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
    except ImportError:
        title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        title = title_match.group(1).strip() if title_match else ""
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return title, text[:MAX_CONTENT_LENGTH]

    title = soup.title.string.strip() if soup.title and soup.title.string else ""

    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
        tag.decompose()

    article = soup.find("article") or soup.find("main") or soup.find(class_=re.compile(r"article|post|content|entry", re.I))
    target = article if article else soup.body or soup

    paragraphs = []
    for p in target.find_all(["p", "h1", "h2", "h3", "h4", "li", "blockquote"]):
        text = p.get_text(separator=" ", strip=True)
        if len(text) > 20:
            tag_name = p.name
            if tag_name.startswith("h"):
                paragraphs.append(f"\n## {text}\n")
            elif tag_name == "blockquote":
                paragraphs.append(f"> {text}")
            elif tag_name == "li":
                paragraphs.append(f"- {text}")
            else:
                paragraphs.append(text)

    content = "\n\n".join(paragraphs)
    return title, content


def _truncate(text: str) -> str:
    if len(text) <= MAX_CONTENT_LENGTH:
        return text
    cut = text[:MAX_CONTENT_LENGTH]
    last_period = max(cut.rfind(". "), cut.rfind("。"), cut.rfind("\n\n"))
    if last_period > MAX_CONTENT_LENGTH * 0.7:
        return cut[:last_period + 1] + "\n\n..."
    return cut + "..."
