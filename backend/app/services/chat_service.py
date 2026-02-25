"""
Chat Service — Perplexity Sonar streaming chat for WeeklyAI.

Uses Perplexity API (OpenAI-compatible) for global low-latency access.
Product data is injected as system context for domain-specific answers.
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
        dark_horses = ProductService.get_dark_horse_products(limit=15, min_index=4)
        rising = ProductService.get_rising_star_products(limit=10)
    except Exception:
        dark_horses = []
        rising = []

    lines = []

    if dark_horses:
        lines.append("=== Dark Horse Products (4-5 pts) ===")
        for p in dark_horses[:15]:
            name = p.get("name", "")
            score = p.get("dark_horse_index", "")
            funding = p.get("funding_total", "")
            why = p.get("why_matters", "")
            region = p.get("region", "")
            cat = p.get("category", "")
            hw = " [Hardware]" if p.get("is_hardware") or p.get("category") == "hardware" else ""
            lines.append(f"- {name} ({score}pts, {region}{hw}): {why} | Funding: {funding} | Category: {cat}")

    if rising:
        lines.append("\n=== Rising Stars (2-3 pts) ===")
        for p in rising[:10]:
            name = p.get("name", "")
            score = p.get("dark_horse_index", "")
            why = p.get("why_matters", "")
            lines.append(f"- {name} ({score}pts): {why}")

    return "\n".join(lines) if lines else "No product data available."


def _build_system_prompt(locale: str = "zh") -> str:
    product_context = _get_product_context(locale)

    if locale == "zh":
        return f"""你是 WeeklyAI 的 AI 助手，专注于帮助用户了解全球最新的 AI 产品动态。

你的知识库包含以下最新 AI 产品数据：

{product_context}

回答规则：
1. 基于上述产品数据回答，如果数据不够，坦诚说明
2. 推荐产品时，提及产品名、评分、融资情况和核心亮点
3. 回答简洁有力，每个产品 1-2 句话即可
4. 如果用户问的不是 AI 产品相关，礼貌引导回主题
5. 使用中文回答"""
    else:
        return f"""You are the WeeklyAI AI Assistant, focused on helping users discover the latest global AI products.

Your knowledge base contains the following latest AI product data:

{product_context}

Response rules:
1. Answer based on the product data above; if insufficient, be upfront about it
2. When recommending products, mention the name, score, funding, and key highlights
3. Keep answers concise — 1-2 sentences per product
4. If the user asks about non-AI topics, politely redirect
5. Respond in English"""


def stream_chat_response(message: str, locale: str = "zh") -> Generator[str, None, None]:
    """Stream a chat response as SSE events via Perplexity API."""
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
                "max_tokens": 2048,
                "temperature": 0.5,
                "stream": True,
            },
            stream=True,
            timeout=25,
        )

        if resp.status_code != 200:
            error_detail = ""
            try:
                err_json = resp.json()
                error_detail = err_json.get("error", {}).get("message", resp.text[:200])
            except Exception:
                error_detail = resp.text[:200]
            msg = f"API error ({resp.status_code}): {error_detail}"
            yield _sse_event({"type": "text", "content": msg})
            yield _sse_event({"type": "done"})
            return

        for line in resp.iter_lines(decode_unicode=True):
            if not line:
                continue
            if not line.startswith("data:"):
                continue

            payload = line[5:].strip()
            if payload == "[DONE]":
                break

            try:
                chunk = json.loads(payload)
                choices = chunk.get("choices", [])
                if choices:
                    delta = choices[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield _sse_event({"type": "text", "content": content})
            except (json.JSONDecodeError, KeyError, IndexError):
                continue

        yield _sse_event({"type": "done"})

    except requests.exceptions.Timeout:
        msg = "请求超时，请重试。" if locale == "zh" else "Request timed out. Please try again."
        yield _sse_event({"type": "text", "content": msg})
        yield _sse_event({"type": "done"})
    except Exception:
        msg = "抱歉，发生了错误。" if locale == "zh" else "Sorry, an error occurred."
        yield _sse_event({"type": "text", "content": msg})
        yield _sse_event({"type": "done"})


def _sse_event(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _no_api_message(locale: str) -> str:
    if locale == "zh":
        return "AI 助手暂不可用（API 未配置）。请先配置环境变量后重试。"
    return "AI assistant is not available (API not configured)."
