// useChat.js - sends messages, streams the reply into the chat, and tracks errors.
import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "../api/chatApi";
import { MAX_MESSAGE_CHARS } from "../config";
import { newId } from "../utils/id";
import { makeTitle } from "../utils/text";

// status: "idle" | "waiting" (sent, no text yet) | "streaming" (text arriving)
export function useChat({ conversation, updateMessages, rename, model, onFailure }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const conversationId = conversation?.id;

  // Switching chats stops any reply that is still arriving.
  useEffect(() => {
    setError(null);
    setStatus("idle");
    return () => abortRef.current?.abort();
  }, [conversationId]);

  // Ask the model to answer `history` (which must end with a user message).
  const run = useCallback(
    async (id, history) => {
      const controller = new AbortController();
      abortRef.current = controller;
      const replyId = newId();

      // An empty assistant message shows the "typing" dots until text arrives.
      updateMessages(id, (msgs) => [...msgs, { id: replyId, role: "assistant", content: "" }]);
      setStatus("waiting");
      setError(null);

      try {
        await streamChat({
          messages: history.map(({ role, content }) => ({ role, content })),
          model,
          signal: controller.signal,
          onToken: (token) => {
            setStatus("streaming");
            updateMessages(id, (msgs) =>
              msgs.map((m) => (m.id === replyId ? { ...m, content: m.content + token } : m))
            );
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError({ code: err.code ?? "unknown", message: err.message });
          onFailure?.();
        }
      } finally {
        // If nothing arrived, remove the empty placeholder.
        updateMessages(id, (msgs) => msgs.filter((m) => !(m.id === replyId && m.content === "")));
        if (abortRef.current === controller) {
          abortRef.current = null;
          setStatus("idle");
        }
      }
    },
    [model, updateMessages, onFailure]
  );

  /** Send a new user message. Returns true if it was sent. */
  const send = useCallback(
    (rawText) => {
      const text = rawText.trim();
      if (!conversation || status !== "idle") return false;
      if (!text) {
        setError({ code: "empty", message: "Please type a message first." });
        return false;
      }
      if (text.length > MAX_MESSAGE_CHARS) {
        setError({
          code: "too_long",
          message: `That message is too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.`,
        });
        return false;
      }

      const userMessage = { id: newId(), role: "user", content: text };
      updateMessages(conversation.id, (msgs) => [...msgs, userMessage]);
      if (conversation.messages.length === 0) rename(conversation.id, makeTitle(text));

      run(conversation.id, [...conversation.messages, userMessage]);
      return true;
    },
    [conversation, status, updateMessages, rename, run]
  );

  /** Try again after an error (only possible when the last message is the user's). */
  const retry = useCallback(() => {
    if (!conversation || status !== "idle") return;
    const last = conversation.messages[conversation.messages.length - 1];
    if (last?.role === "user") run(conversation.id, conversation.messages);
  }, [conversation, status, run]);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const dismissError = useCallback(() => setError(null), []);

  const lastMessage = conversation?.messages[conversation.messages.length - 1];
  const canRetry = status === "idle" && lastMessage?.role === "user";

  return { status, error, canRetry, send, retry, stop, dismissError };
}
