// config.js - text and limits you may want to edit. No secrets live here.

export const APP_NAME = "Watashi No Sensei";
export const APP_NAME_JP = "私の先生";

// Keep this equal to MAX_MESSAGE_CHARS in backend/config.py.
export const MAX_MESSAGE_CHARS = 4000;

// >>> REPLACE IF NEEDED: base address of the API. <<<
// Empty means "same address as the page" (the Vite proxy handles it in dev).
// Set VITE_API_BASE_URL in frontend/.env.local for a separate backend address.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// How often (ms) the app re-checks that the backend and Ollama are running.
export const STATUS_POLL_MS = 20000;

// Quick-start ideas shown on an empty chat.
export const SUGGESTIONS = [
  { mark: "あ", label: "Teach me hiragana", prompt: "Can you teach me the first five hiragana characters?" },
  { mark: "こ", label: "How do I say hello?", prompt: "How do I greet people in Japanese at different times of the day?" },
  { mark: "は", label: "は or が?", prompt: "What is the difference between は and が?" },
  { mark: "空", label: "Why is the sky blue?", prompt: "Why is the sky blue? And how do I say it in Japanese?" },
];
