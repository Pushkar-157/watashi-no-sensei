"""
config.py - every setting the backend needs, in one place.

Values come from environment variables (or a local ".env" file, see
".env.example"). Nothing secret or machine-specific is hard-coded here.
"""

import os

from dotenv import load_dotenv

# Read backend/.env if it exists. Real environment variables win over the file.
load_dotenv()


def _get_float(name: str, default: float) -> float:
    """Read a number from the environment, falling back to a default."""
    try:
        return float(os.getenv(name, default))
    except ValueError:
        return default


def _get_int(name: str, default: int) -> int:
    """Read a whole number from the environment, falling back to a default."""
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


# ---- Ollama -------------------------------------------------------------
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_TIMEOUT = _get_float("OLLAMA_TIMEOUT", 120)
OLLAMA_TEMPERATURE = _get_float("OLLAMA_TEMPERATURE", 0.7)
OLLAMA_NUM_CTX = _get_int("OLLAMA_NUM_CTX", 4096)

# ---- Conversation limits --------------------------------------------------
MAX_HISTORY_MESSAGES = _get_int("MAX_HISTORY_MESSAGES", 20)
# Keep this equal to MAX_MESSAGE_CHARS in frontend/src/config.js.
MAX_MESSAGE_CHARS = 4000

# ---- Web server -----------------------------------------------------------
HOST = os.getenv("HOST", "127.0.0.1")
PORT = _get_int("PORT", 5001)
DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
