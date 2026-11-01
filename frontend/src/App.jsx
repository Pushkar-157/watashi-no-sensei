// App.jsx - puts the pieces together: sidebar, header, conversation and composer.
import { useCallback, useEffect, useState } from "react";

import Banner from "./components/Banner";
import ChatWindow from "./components/ChatWindow";
import Composer from "./components/Composer";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { useChat } from "./hooks/useChat";
import { useConversations } from "./hooks/useConversations";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  const convos = useConversations();

  // "" means "use the server's default model" (set OLLAMA_MODEL in backend/.env).
  const [model, setModel] = useLocalStorage("wns.model", "");

  const { status, notice, refresh } = useBackendStatus(model);

  const chat = useChat({
    conversation: convos.active,
    updateMessages: convos.updateMessages,
    rename: convos.rename,
    model,
    onFailure: refresh, // after a failed reply, re-check the connection light
  });

  // The sidebar slides in over the page on small screens.
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  return (
    <div className="app">
      <Sidebar
        conversations={convos.conversations}
        activeId={convos.active.id}
        open={menuOpen}
        onNew={() => {
          convos.startNew();
          closeMenu();
        }}
        onSelect={(id) => {
          convos.select(id);
          closeMenu();
        }}
        onDelete={convos.remove}
        onClose={closeMenu}
      />

      <main className="main">
        <Header
          status={status}
          model={model}
          onModelChange={setModel}
          onMenu={() => setMenuOpen(true)}
        />

        {notice && (
          <div className="banner-slot">
            <Banner tone="notice" title={notice.title} text={notice.text} />
          </div>
        )}

        <ChatWindow
          conversationId={convos.active.id}
          messages={convos.active.messages}
          status={chat.status}
          error={chat.error}
          canRetry={chat.canRetry}
          onRetry={chat.retry}
          onDismissError={chat.dismissError}
          onPickSuggestion={chat.send}
        />

        <Composer
          status={chat.status}
          onSend={chat.send}
          onStop={chat.stop}
          focusKey={convos.active.id}
        />
      </main>
    </div>
  );
}
