"""
ollama_service.py - all communication with Ollama lives here.

The rest of the app never imports `ollama` directly. If Ollama fails, this
module converts the failure into a ChatError with a friendly message.
"""

from typing import Iterator

import httpx
import ollama

import config
from prompts import SYSTEM_PROMPT

def _client() -> ollama.Client:
    """Create SDK client with credentials loaded from server environment."""
    headers = None
    if config.OLLAMA_HOST.rstrip("/") == "https://ollama.com":
        import os

        api_key = os.getenv("OLLAMA_API_KEY")
        if not api_key:
            raise ChatError("ollama_auth", "OLLAMA_API_KEY is not configured on the backend.")
        headers = {"Authorization": f"Bearer {api_key}"}
    return ollama.Client(host=config.OLLAMA_HOST, timeout=config.OLLAMA_TIMEOUT, headers=headers)


class ChatError(Exception):
    """A problem talking to Ollama, with a code for the UI and a friendly message."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def _translate_error(exc: Exception, model: str) -> ChatError:
    """Turn any exception from the Ollama SDK into a ChatError."""
    if isinstance(exc, ChatError):
        return exc

    # Ollama is not running (or the address in OLLAMA_HOST is wrong).
    if isinstance(exc, (ConnectionError, httpx.ConnectError)):
        return ChatError(
            "ollama_unreachable",
            "I can't reach Ollama Cloud right now. Please try again shortly.",
        )

    # Ollama took too long to answer.
    if isinstance(exc, httpx.TimeoutException):
        return ChatError(
            "timeout",
            "Ollama Cloud took too long to answer. Please try again in a moment.",
        )

    # Ollama answered, but with an error.
    if isinstance(exc, ollama.ResponseError):
        if exc.status_code in (401, 403):
            return ChatError("ollama_auth", "Ollama Cloud authentication failed. Check the OLLAMA_API_KEY setting.")
        if exc.status_code == 404:
            return ChatError(
                "model_not_found",
                f'The cloud model "{model}" was not found. Check the OLLAMA_MODEL setting.',
            )
        return ChatError("model_error", f"The model reported a problem: {exc.error}")

    return ChatError("unknown", "Something went wrong. Please try again.")


def stream_reply(messages: list[dict], model: str | None = None) -> Iterator[str]:
    """Send the conversation to Ollama and yield the reply piece by piece."""
    model = model or config.OLLAMA_MODEL

    # The system prompt always comes first (see prompts.py).
    full_conversation = [{"role": "system", "content": SYSTEM_PROMPT}, *messages]

    try:
        stream = _client().chat(
            model=model,
            messages=full_conversation,
            stream=True,
            options={
                "temperature": config.OLLAMA_TEMPERATURE,
                "num_ctx": config.OLLAMA_NUM_CTX,
            },
        )
        for chunk in stream:
            piece = chunk.message.content
            if piece:
                yield piece
    except Exception as exc:  # noqa: BLE001 - converted to a friendly ChatError
        raise _translate_error(exc, model) from exc


def list_models() -> list[str]:
    """Return the names of the models installed in Ollama (also tests the connection)."""
    try:
        return sorted(m.model for m in _client().list().models)
    except Exception as exc:  # noqa: BLE001
        raise _translate_error(exc, "") from exc


def is_installed(model: str, installed: list[str]) -> bool:
    """True if `model` is installed. "llama3.2" matches "llama3.2:latest"."""
    return model in installed or f"{model}:latest" in installed
