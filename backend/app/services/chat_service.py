"""
Chat Service — GLM-powered conversational AI for WeeklyAI.

Provides streaming responses about AI products using the Zhipu GLM model,
with product data injected as system context.

Designed to work standalone (no crawler dependency) for Vercel deployment.
"""

import json
import os
from typing import Generator


def _get_api_key() -> str:
    return os.environ.get('ZHIPU_API_KEY', '')


def _get_model() -> str:
    return os.environ.get('GLM_MODEL', 'glm-4.7')


def _get_product_context(locale: str = "zh") -> str:
    """Build a product summary to inject into the system prompt."""
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
    """Build the system prompt with product context."""
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


def _get_zhipu_client():
    """Create a ZhipuAI client directly (no crawler dependency)."""
    api_key = _get_api_key()
    if not api_key:
        return None
    try:
        from zhipuai import ZhipuAI
        return ZhipuAI(api_key=api_key)
    except ImportError:
        return None


def stream_chat_response(message: str, locale: str = "zh") -> Generator[str, None, None]:
    """
    Stream a chat response as SSE events.

    Yields SSE-formatted strings: 'data: {...}\\n\\n'
    """
    client = _get_zhipu_client()

    if not client:
        yield _sse_event({"type": "text", "content": _no_api_message(locale)})
        yield _sse_event({"type": "done"})
        return

    system_prompt = _build_system_prompt(locale)

    try:
        response = client.chat.completions.create(
            model=_get_model(),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            max_tokens=2048,
            temperature=0.6,
            stream=True,
        )

        for chunk in response:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            content = getattr(delta, 'content', None) or ""
            if content:
                yield _sse_event({"type": "text", "content": content})

        yield _sse_event({"type": "done"})

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "并发" in error_msg:
            msg = "服务繁忙，请稍后再试。" if locale == "zh" else "Service is busy, please try again later."
        else:
            msg = "抱歉，发生了错误。" if locale == "zh" else "Sorry, an error occurred."
        yield _sse_event({"type": "text", "content": msg})
        yield _sse_event({"type": "done"})


def _sse_event(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _no_api_message(locale: str) -> str:
    if locale == "zh":
        return "AI 助手暂不可用（ZHIPU_API_KEY 未配置）。请先配置环境变量后重试。"
    return "AI assistant is not available (ZHIPU_API_KEY not configured). Please configure the environment variable and try again."
