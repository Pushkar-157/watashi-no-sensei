// chatApi.js - the only file that talks to the backend.
import { API_BASE_URL } from "../config";

/** An error with a short code (for logic) and a friendly message (for people). */
export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

const UNREACHABLE =
  "I can’t reach the Sensei server. Make sure the backend is running (see the README).";

// fetch() that turns network failures into a friendly ApiError.
async function request(path, options) {
  try {
    return await fetch(`${API_BASE_URL}${path}`, options);
  } catch (err) {
    if (err.name === "AbortError") throw err; // the user pressed Stop
    throw new ApiError("backend_unreachable", UNREACHABLE);
  }
}

/** Ask the backend whether Ollama is running and which models exist. */
export async function getStatus() {
  const res = await request("/api/status");
  if (!res.ok) {
    throw new ApiError("backend_unreachable", UNREACHABLE);
  }
  return res.json();
}

/**
 * Send the conversation and stream the reply.
 * onToken(text) is called for every piece. Resolves when the reply is complete.
 */
export async function streamChat({ messages, model, signal, onToken }) {
  const res = await request("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: model || undefined }),
    signal,
  });

  if (!res.ok) {
    // 502/503/504 come from the dev proxy when the backend is not running.
    let message = [502, 503, 504].includes(res.status)
      ? UNREACHABLE
      : "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
    } catch {
      /* the body was not JSON, keep the default message */
    }
    throw new ApiError("request_failed", message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  // Each line of the stream is one JSON event: token, done or error.
  const handleLine = (line) => {
    if (!line.trim()) return;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      return; // ignore a damaged line
    }
    if (event.type === "token") onToken(event.content);
    else if (event.type === "error") throw new ApiError(event.code, event.message);
    else if (event.type === "done") finished = true;
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // the last piece may be an unfinished line
    lines.forEach(handleLine);
  }
  if (buffer.trim()) handleLine(buffer);

  if (!finished) {
    throw new ApiError("stream_interrupted", "The reply was cut off. Please try again.");
  }
}
