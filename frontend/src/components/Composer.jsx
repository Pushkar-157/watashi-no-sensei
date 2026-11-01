// Composer.jsx - the message box with the send / stop button.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MAX_MESSAGE_CHARS } from "../config";
import { SendIcon, StopIcon } from "./Icons";

export default function Composer({ status, onSend, onStop, focusKey }) {
  const [text, setText] = useState("");
  const [nudged, setNudged] = useState(false);
  const inputRef = useRef(null);

  const busy = status !== "idle";
  const hasText = text.trim().length > 0;
  const tooLong = text.length > MAX_MESSAGE_CHARS;
  const showCounter = text.length > MAX_MESSAGE_CHARS * 0.8;

  // Focus the box when the page opens or the chat changes.
  useEffect(() => {
    inputRef.current?.focus();
  }, [focusKey]);

  // Grow the box as the text gets longer (up to a limit).
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  function submit() {
    if (busy) return;
    if (!hasText) {
      // Empty message: shake the box and show a hint instead of sending.
      setNudged(true);
      setTimeout(() => setNudged(false), 500);
      return;
    }
    if (onSend(text)) setText("");
  }

  function handleKeyDown(e) {
    // While typing Japanese, Enter confirms the conversion. Don't send then.
    const composing = e.nativeEvent.isComposing || e.keyCode === 229;
    if (e.key === "Enter" && !e.shiftKey && !composing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="composer-wrap">
      <div className={`composer${nudged ? " is-nudged" : ""}`}>
        <label className="sr-only" htmlFor="message-input">Message Sensei</label>
        <textarea
          id="message-input"
          ref={inputRef}
          rows={1}
          value={text}
          placeholder="Ask Sensei anything…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {busy ? (
          <button className="send-btn is-stop" onClick={onStop} aria-label="Stop the reply" title="Stop">
            <StopIcon />
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={submit}
            disabled={!hasText || tooLong}
            aria-label="Send message"
            title="Send"
          >
            <SendIcon />
          </button>
        )}
      </div>

      <div className="composer-hint">
        <span>{nudged ? "Type a message first." : "Press Enter to send. Shift and Enter add a new line."}</span>
        {showCounter && (
          <span className={tooLong ? "over" : ""}>{text.length} / {MAX_MESSAGE_CHARS}</span>
        )}
      </div>
    </div>
  );
}
