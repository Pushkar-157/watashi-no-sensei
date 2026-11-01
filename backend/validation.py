"""
validation.py - checks everything the browser sends before it reaches Ollama.
"""

import re

import config


class ValidationError(Exception):
    """Raised when a request is not valid. The message is safe to show to users."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


# Model names look like "llama3.2", "qwen2.5:7b" or "library/gemma3:4b".
_MODEL_PATTERN = re.compile(r"^[A-Za-z0-9._:/-]{1,100}$")


def clean_messages(raw) -> list[dict]:
    """Validate and tidy the conversation sent by the browser.

    Returns a list of {"role", "content"} dictionaries that ends with a
    user message and is trimmed to the most recent MAX_HISTORY_MESSAGES.
    """
    if not isinstance(raw, list) or not raw:
        raise ValidationError("Please type a message first.")

    cleaned = []
    for item in raw:
        if not isinstance(item, dict):
            raise ValidationError("The conversation was not in the expected format.")

        role = item.get("role")
        content = item.get("content")

        # Only "user" and "assistant" are accepted. The system prompt is added
        # by the server, so nobody can replace the teacher's instructions.
        if role not in ("user", "assistant") or not isinstance(content, str):
            raise ValidationError("The conversation was not in the expected format.")

        content = content.strip()
        if not content:
            continue  # ignore empty messages
        if len(content) > config.MAX_MESSAGE_CHARS:
            raise ValidationError(
                f"That message is too long. Please keep it under "
                f"{config.MAX_MESSAGE_CHARS} characters."
            )
        cleaned.append({"role": role, "content": content})

    # Keep only the most recent messages so the model's memory is not overloaded.
    cleaned = cleaned[-config.MAX_HISTORY_MESSAGES:]

    # A trimmed history should not start with the assistant talking.
    while cleaned and cleaned[0]["role"] == "assistant":
        cleaned.pop(0)

    if not cleaned or cleaned[-1]["role"] != "user":
        raise ValidationError("Please type a message first.")

    return cleaned


def clean_model(raw) -> str | None:
    """Validate the optional model name. None means "use the default"."""
    if raw is None or raw == "":
        return None
    if not isinstance(raw, str) or not _MODEL_PATTERN.match(raw):
        raise ValidationError("That model name doesn't look right.")
    return raw
