// Sidebar.jsx - brand, "New chat" button and the list of past chats.
import { useState } from "react";
import { APP_NAME, APP_NAME_JP } from "../config";
import { CloseIcon, PlusIcon, TrashIcon } from "./Icons";

// One row in the chat list. Deleting asks for a quick confirmation first.
function ConversationItem({ conversation, active, onSelect, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className={`convo${active ? " is-active" : ""}`}>
      {confirming ? (
        <div className="convo-confirm" role="group" aria-label="Confirm delete">
          <span>Delete this chat?</span>
          <button className="btn-danger" onClick={onDelete}>Delete</button>
          <button className="btn-quiet" onClick={() => setConfirming(false)}>Keep</button>
        </div>
      ) : (
        <>
          <button
            className="convo-main"
            onClick={onSelect}
            aria-current={active ? "page" : undefined}
            title={conversation.title}
          >
            <span className="convo-title">{conversation.title}</span>
          </button>
          <button
            className="convo-delete icon-btn"
            aria-label={`Delete chat: ${conversation.title}`}
            onClick={() => setConfirming(true)}
          >
            <TrashIcon />
          </button>
        </>
      )}
    </li>
  );
}

export default function Sidebar({ conversations, activeId, open, onNew, onSelect, onDelete, onClose }) {
  return (
    <>
      {/* Dark overlay behind the sidebar on small screens */}
      <div className={`scrim${open ? " is-visible" : ""}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar${open ? " is-open" : ""}`} aria-label="Chat history">
        <div className="sidebar-top">
          <div className="brand">
            <span className="seal" aria-hidden="true">先</span>
            <div>
              <div className="brand-name">{APP_NAME}</div>
              <div className="brand-jp" lang="ja">{APP_NAME_JP}</div>
            </div>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <button className="btn-primary new-chat" onClick={onNew}>
          <PlusIcon /> New chat
        </button>

        <nav className="history" aria-label="Your chats">
          <h2 className="history-heading">Your chats</h2>
          <ul>
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onSelect={() => onSelect(c.id)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </ul>
        </nav>

        <p className="sidebar-note">Chats are saved in this browser only.</p>
      </aside>
    </>
  );
}
