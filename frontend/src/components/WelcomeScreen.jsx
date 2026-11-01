// WelcomeScreen.jsx - shown when a chat is empty. Starts with a first lesson: a greeting.
import { SUGGESTIONS } from "../config";

export default function WelcomeScreen({ onPick, disabled }) {
  return (
    <section className="welcome" aria-label="Welcome">
      <p className="welcome-jp" lang="ja">こんにちは</p>
      <p className="welcome-romaji">konnichiwa</p>
      <p className="welcome-en">Hello</p>

      <p className="welcome-lead">
        I’m Sensei, your Japanese teacher. Ask me anything, or pick a place to start.
      </p>

      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s.label} className="suggestion" disabled={disabled} onClick={() => onPick(s.prompt)}>
            <span className="suggestion-mark" lang="ja" aria-hidden="true">{s.mark}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
