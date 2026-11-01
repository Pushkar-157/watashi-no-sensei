// Banner.jsx - a friendly box for errors and heads-up notices.

// Turns `code like this` (between backticks) into <code> elements.
function renderInline(text) {
  return text.split("`").map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}

export default function Banner({ tone = "error", title, text, children }) {
  return (
    <div className="banner" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      <div className="banner-body">
        {title && <div className="banner-title">{title}</div>}
        {text && <div className="banner-text">{renderInline(text)}</div>}
        {children && <div className="banner-actions">{children}</div>}
      </div>
    </div>
  );
}
