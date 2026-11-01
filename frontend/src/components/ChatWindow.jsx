// ChatWindow.jsx - the scrolling conversation (or the welcome screen) plus any error.
import { useEffect, useRef } from "react";
import Banner from "./Banner";
import Message from "./Message";
import WelcomeScreen from "./WelcomeScreen";

export default function ChatWindow({
  conversationId,
  messages,
  status,
  error,
  canRetry,
  onRetry,
  onDismissError,
  onPickSuggestion,
}) {
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);

  // Remember whether the reader is at the bottom. If they scrolled up to
  // re-read something, don't yank them down while new text arrives.
  function handleScroll() {
    const el = scrollRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  // Opening a different chat always starts at the bottom.
  useEffect(() => {
    stickToBottom.current = true;
  }, [conversationId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: status === "streaming" ? "auto" : "smooth" });
    }
  }, [conversationId, messages, status, error]);

  const lastId = messages[messages.length - 1]?.id;

  return (
    <div className="chat-scroll" ref={scrollRef} onScroll={handleScroll}>
      <div
        className="chat-inner"
        role="log"
        aria-live="polite"
        aria-busy={status === "streaming"}
      >
        {messages.length === 0 ? (
          <WelcomeScreen onPick={onPickSuggestion} disabled={status !== "idle"} />
        ) : (
          messages.map((m) => (
            <Message key={m.id} message={m} isStreaming={status === "streaming" && m.id === lastId} />
          ))
        )}

        {error && (
          <Banner tone="error" title="That didn’t work" text={error.message}>
            {canRetry && <button className="btn-primary btn-small" onClick={onRetry}>Try again</button>}
            <button className="btn-quiet" onClick={onDismissError}>Dismiss</button>
          </Banner>
        )}
      </div>
    </div>
  );
}
