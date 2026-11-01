// Message.jsx - one chat message. The teacher's replies are rendered as Markdown.
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckIcon, CopyIcon } from "./Icons";

// Wrap tables so wide ones scroll sideways instead of breaking the layout.
// Links open in a new tab. (`node` is removed so it isn't passed to the DOM.)
const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="table-wrap"><table {...props} /></div>
  ),
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
};

function TypingDots() {
  return (
    <div className="typing" role="status" aria-label="Sensei is typing">
      <span /><span /><span />
    </div>
  );
}

export default function Message({ message, isStreaming }) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="message message-user">
        <div className="bubble">{message.content}</div>
      </div>
    );
  }

  const isEmpty = message.content === "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  }

  return (
    <div className="message message-assistant">
      <span className="seal seal-sm" aria-hidden="true">先</span>
      <div className="assistant-body">
        <div className="assistant-name">Sensei</div>

        {isEmpty ? (
          <TypingDots />
        ) : (
          <div className={`markdown${isStreaming ? " is-streaming" : ""}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isEmpty && !isStreaming && (
          <div className="message-actions">
            <button className="chip-btn" onClick={copy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
