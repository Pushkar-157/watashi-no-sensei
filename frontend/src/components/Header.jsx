// Header.jsx - top bar with the menu button, model picker and connection status.
import { APP_NAME } from "../config";
import { MenuIcon } from "./Icons";

const STATUS_LOOK = {
  checking: { label: "Connecting", tone: "wait" },
  ready: { label: "Ollama ready", tone: "ok" },
  ollama_down: { label: "Ollama offline", tone: "bad" },
  backend_down: { label: "Server offline", tone: "bad" },
};

export default function Header({ status, model, onModelChange, onMenu }) {
  const look = STATUS_LOOK[status.state] ?? STATUS_LOOK.checking;

  // If the saved choice is no longer installed, still show it so the menu is honest.
  const missingChoice = model && !status.models.includes(model) ? model : null;

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <MenuIcon />
      </button>
      <span className="topbar-title">{APP_NAME}</span>

      <label className="model-picker">
        <span className="sr-only">Model</span>
        <select value={model} onChange={(e) => onModelChange(e.target.value)} title="Choose the model">
          <option value="">Default ({status.defaultModel || "…"})</option>
          {status.models.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
          {missingChoice && <option value={missingChoice}>{missingChoice} (not installed)</option>}
        </select>
      </label>

      <span className="status-pill" data-tone={look.tone} title={look.label}>
        <span className="status-dot" aria-hidden="true" />
        <span className="status-label">{look.label}</span>
      </span>
    </header>
  );
}
