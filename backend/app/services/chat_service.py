"""
Chat Service — GLM-powered conversational AI for WeeklyAI.

Uses raw HTTP requests to Zhipu API (no zhipuai SDK dependency)
for maximum compatibility with Vercel Serverless.
"""

import json
import os
import time
import requests
from typing import Generator


GLM_CHAT_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"


def _get_api_key() -> str:
    return os.environ.get('ZHIPU_API_KEY', '')


def _get_model() -> str:
    return os.environ.get('GLM_MODEL', 'glm-4.7')


def _generate_token(api_key: str) -> str:
    """Generate JWT token for Zhipu API authentication.

    Manually builds the JWT to ensure exact header format required by Zhipu:
    {"alg": "HS256", "sign_type": "SIGN"}
    """
    import base64
    import hashlib
    import hmac

    parts = api_key.split(".")
    if len(parts) != 2:
        return api_key

    kid, secret = parts
    now_ms = int(time.time() * 1000)
    exp_ms = now_ms + 3600 * 1000

    header = {"alg": "HS256", "sign_type": "SIGN"}
    payload = {"api_key": kid, "exp": exp_ms, "timestamp": now_ms}

    def b64url(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

    header_b64 = b64url(json.dumps(header, separators=(",", ":")).encode())
    payload_b64 = b64url(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{header_b64}.{payload_b64}"
    signature = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = b64url(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def _get_product_context(locale: str = "zh") -> str:
    """Build a product summary to inject into the system prompt."""
    try:
        from app.services.product_service import ProductService
        dark_horses = ProductService.get_dark_horse_products(limit=8, min_index=4)
        rising = ProductService.get_rising_star_products(limit=5)
    except Exception:
        dark_horses = []
        rising = []

    lines = []

    if dark_horses:
        lines.append("=== Dark Horse Products (4-5 pts) ===")
        for p in dark_horses[:8]:
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
        for p in rising[:5]:
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
1. 基于上述产品数据回答，不够就坦诚说明
2. 推荐产品时提及产品名、评分、融资和亮点
3. 严格控制在 200 字以内，每个产品 1 句话
4. 非 AI 产品问题礼貌引导回主题
5. 使用中文"""
    else:
        return f"""You are the WeeklyAI AI Assistant, focused on helping users discover the latest global AI products.

Your knowledge base contains the following latest AI product data:

{product_context}

Rules:
1. Answer based on product data above; be upfront if insufficient
2. Mention product name, score, funding, and one key highlight
3. Keep under 200 words total, 1 sentence per product
4. Redirect non-AI questions politely
5. Respond in English"""


def get_chat_response(message: str, locale: str = "zh") -> dict:
    """Get a complete chat response (non-streaming for Vercel 10s limit)."""
    api_key = _get_api_key()

    if not api_key:
        return {"success": False, "content": _no_api_message(locale)}

    system_prompt = _build_system_prompt(locale)
    token = _generate_token(api_key)

    try:
        resp = requests.post(
            GLM_CHAT_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "model": _get_model(),
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "max_tokens": 600,
                "temperature": 0.5,
                "stream": False,
                "thinking": {"type": "disabled"},
            },
            timeout=9,
        )

        if resp.status_code != 200:
            error_detail = ""
            try:
                err_json = resp.json()
                error_detail = err_json.get("error", {}).get("message", resp.text[:200])
            except Exception:
                error_detail = resp.text[:200]
            return {"success": False, "content": f"API error ({resp.status_code}): {error_detail}"}

        data = resp.json()
        choices = data.get("choices", [])
        if choices:
            content = choices[0].get("message", {}).get("content", "")
            if content:
                return {"success": True, "content": content}

        return {"success": False, "content": "Empty response from model"}

    except requests.exceptions.Timeout:
        msg = "回答生成超时，请重试。" if locale == "zh" else "Response timed out. Please try again."
        return {"success": False, "content": msg}
    except Exception as e:
        msg = "抱歉，发生了错误。" if locale == "zh" else "Sorry, an error occurred."
        return {"success": False, "content": msg}


def _sse_event(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _no_api_message(locale: str) -> str:
    if locale == "zh":
        return "AI 助手暂不可用（ZHIPU_API_KEY 未配置）。请先配置环境变量后重试。"
    return "AI assistant is not available (ZHIPU_API_KEY not configured)."
