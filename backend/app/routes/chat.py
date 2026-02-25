"""
Chat API Blueprint — Streaming AI chat powered by GLM.

POST /api/v1/chat
  Body: { "message": "...", "locale": "zh" | "en" }
  Response: SSE stream
"""

from flask import Blueprint, request, Response, jsonify
from collections import defaultdict
import time
import os

chat_bp = Blueprint('chat', __name__)

_chat_rate_tracker: dict[str, list[float]] = defaultdict(list)
CHAT_RATE_LIMIT = 10  # requests per minute per IP


def _is_chat_allowed(ip: str) -> bool:
    now = time.time()
    minute_ago = now - 60
    _chat_rate_tracker[ip] = [t for t in _chat_rate_tracker[ip] if t > minute_ago]
    if len(_chat_rate_tracker[ip]) >= CHAT_RATE_LIMIT:
        return False
    _chat_rate_tracker[ip].append(now)
    return True


@chat_bp.route('/status', methods=['GET'])
def chat_status():
    """Check if chat service is configured + test token generation."""
    key = os.environ.get('ZHIPU_API_KEY', '')
    has_key = bool(key and len(key) > 5)
    has_jwt = False
    jwt_version = ""
    token_test = ""
    try:
        import jwt
        has_jwt = True
        jwt_version = getattr(jwt, '__version__', 'unknown')
        if has_key:
            from app.services.chat_service import _generate_token
            tok = _generate_token(key)
            token_test = tok[:20] + '...' if tok != key else 'FALLBACK_RAW_KEY'
    except Exception as e:
        token_test = f"ERROR: {str(e)[:80]}"
    return jsonify({
        'success': True,
        'has_api_key': has_key,
        'key_prefix': key[:8] + '...' if has_key else 'NOT_SET',
        'has_jwt': has_jwt,
        'jwt_version': jwt_version,
        'token_test': token_test,
        'model': os.environ.get('GLM_MODEL', 'glm-4.7'),
    })


@chat_bp.route('', methods=['POST'])
def chat():
    """Stream a chat response via SSE."""
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr) or "unknown"
    client_ip = client_ip.split(',')[0].strip()

    if not _is_chat_allowed(client_ip):
        return jsonify({
            'success': False,
            'message': 'Chat rate limit exceeded. Please wait a moment.',
            'error': 'TOO_MANY_REQUESTS'
        }), 429

    body = request.get_json(silent=True) or {}
    message = str(body.get('message', '')).strip()
    locale = str(body.get('locale', 'zh')).strip()

    if not message:
        return jsonify({
            'success': False,
            'message': 'Message is required.',
            'error': 'BAD_REQUEST'
        }), 400

    if len(message) > 2000:
        return jsonify({
            'success': False,
            'message': 'Message too long (max 2000 chars).',
            'error': 'BAD_REQUEST'
        }), 400

    if locale not in ("zh", "en"):
        locale = "zh"

    from app.services.chat_service import stream_chat_response

    def generate():
        yield from stream_chat_response(message, locale)

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        }
    )
