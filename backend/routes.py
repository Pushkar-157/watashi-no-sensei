"""
routes.py - the HTTP endpoints the React app talks to.

  GET  /api/status  -> is Ollama running, which models are installed
  POST /api/chat    -> stream the teacher's reply as newline-delimited JSON
"""

import json

from flask import Blueprint, Response, jsonify, request, stream_with_context

import config
import ollama_service
from ollama_service import ChatError
from validation import ValidationError, clean_messages, clean_model

bp = Blueprint("api", __name__, url_prefix="/api")


def _line(event: dict) -> str:
    """Encode one streaming event as a single JSON line."""
    return json.dumps(event, ensure_ascii=False) + "\n"


@bp.get("/status")
def status():
    """Report whether Ollama is reachable. Always answers 200 so the UI can read it."""
    try:
        models = ollama_service.list_models()
    except ChatError as err:
        return jsonify(
            ollama=False,
            code=err.code,
            message=err.message,
            default_model=config.OLLAMA_MODEL,
            models=[],
        )

    return jsonify(
        ollama=True,
        default_model=config.OLLAMA_MODEL,
        model_installed=ollama_service.is_installed(config.OLLAMA_MODEL, models),
        models=models,
    )


@bp.post("/chat")
def chat():
    """Stream a reply. Each line is {"type": "token" | "done" | "error", ...}."""
    payload = request.get_json(silent=True) or {}

    try:
        messages = clean_messages(payload.get("messages"))
        model = clean_model(payload.get("model"))
    except ValidationError as err:
        return jsonify(error={"code": "invalid_request", "message": err.message}), 400

    def generate():
        try:
            for piece in ollama_service.stream_reply(messages, model):
                yield _line({"type": "token", "content": piece})
            yield _line({"type": "done"})
        except ChatError as err:
            # Errors that happen mid-stream are sent as a final event.
            yield _line({"type": "error", "code": err.code, "message": err.message})

    return Response(
        stream_with_context(generate()),
        mimetype="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
