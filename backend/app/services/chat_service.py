"""
Chat Service — Perplexity Sonar chat for WeeklyAI.

Uses non-streaming mode to avoid Vercel 10s function timeout truncation.
Returns complete response as a single SSE event.
"""

import json
import os
import requests
from typing import Generator


PERPLEXITY_CHAT_URL = "https://api.perplexity.ai/chat/completions"


def _get_api_key() -> str:
    return os.environ.get('PERPLEXITY_API_KEY', '')


def _get_model() -> str:
    return os.environ.get('PERPLEXITY_CHAT_MODEL', 'sonar')


def _get_product_context(locale: str = "zh") -> str:
    try:
        from app.services.product_service import ProductService
        dark_horses = ProductService.get_dark_horse_products(limit=6, min_index=4)
        rising = ProductService.get_rising_star_products(limit=4)
    except Exception:
        dark_horses = []
        rising = []

    lines = []
    if dark_horses:
        lines.append("=== Dark Horses (4-5pts) ===")
        for p in dark_horses[:6]:
            name = p.get("name", "")
            score = p.get("dark_horse_index", "")
            funding = p.get("funding_total", "")
            why = p.get("why_matters", "")
            lines.append(f"- {name} ({score}pts): {why} | {funding}")

    if rising:
        lines.append("=== Rising Stars (2-3pts) ===")
        for p in rising[:4]:
            name = p.get("name", "")
            score = p.get("dark_horse_index", "")
            why = p.get("why_matters", "")
            lines.append(f"- {name} ({score}pts): {why}")

    return "\n".join(lines) if lines else "No product data available."


def _build_system_prompt(locale: str = "zh") -> str:
    product_context = _get_product_context(locale)

    if locale == "zh":
        return f"""你是WeeklyAI助手。基于以下AI产品数据简洁回答，每个产品1-2句。

{product_context}

用中文回答，简洁有力。"""
    else:
        return f"""You are the WeeklyAI assistant. Answer concisely based on the AI product data below, 1-2 sentences per product.

{product_context}

Be brief and direct."""


def stream_chat_response(message: str, locale: str = "zh") -> Generator[str, None, None]:
    """Get a complete response and return as SSE events."""
    api_key = _get_api_key()

    if not api_key:
        yield _sse_event({"type": "text", "content": _no_api_message(locale)})
        yield _sse_event({"type": "done"})
        return

    system_prompt = _build_system_prompt(locale)

    try:
        resp = requests.post(
            PERPLEXITY_CHAT_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": _get_model(),
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "max_tokens": 512,
                "temperature": 0.3,
                "stream": False,
            },
            timeout=9,
        )

        if resp.status_code != 200:
            error_detail = resp.text[:150]
            yield _sse_event({"type": "text", "content": f"API error ({resp.status_code})"})
            yield _sse_event({"type": "done"})
            return

        data = resp.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            msg = "未能生成回答，请重试。" if locale == "zh" else "No response generated. Please try again."
            yield _sse_event({"type": "text", "content": msg})
            yield _sse_event({"type": "done"})
            return

        content = _clean_citations(content)

        chunk_size = 4
        for i in range(0, len(content), chunk_size):
            yield _sse_event({"type": "text", "content": content[i:i + chunk_size]})

        yield _sse_event({"type": "done"})

    except requests.exceptions.Timeout:
        msg = "请求超时，请重试。" if locale == "zh" else "Request timed out."
        yield _sse_event({"type": "text", "content": msg})
        yield _sse_event({"type": "done"})
    except Exception:
        msg = "抱歉，发生了错误。" if locale == "zh" else "Sorry, an error occurred."
        yield _sse_event({"type": "text", "content": msg})
        yield _sse_event({"type": "done"})


def _clean_citations(text: str) -> str:
    """Remove Perplexity citation markers like [1][2]."""
    import re
    return re.sub(r'\[\d+\]', '', text).strip()


def _sse_event(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _no_api_message(locale: str) -> str:
    if locale == "zh":
        return "AI 助手暂不可用（API 未配置）。"
    return "AI assistant not available (API not configured)."
