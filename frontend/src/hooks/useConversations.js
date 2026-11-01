// useConversations.js - the list of chats, saved in this browser (localStorage).
import { useCallback, useEffect, useMemo, useState } from "react";
import { newId } from "../utils/id";

const STORAGE_KEY = "wns.conversations.v1";

const blankConversation = () => ({
  id: newId(),
  title: "New chat",
  messages: [],
  updatedAt: Date.now(),
});

function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.conversations) && saved.conversations.length > 0) {
      const stillExists = saved.conversations.some((c) => c.id === saved.activeId);
      return {
        conversations: saved.conversations,
        activeId: stillExists ? saved.activeId : saved.conversations[0].id,
      };
    }
  } catch {
    /* nothing saved yet, or the data was damaged */
  }
  const first = blankConversation();
  return { conversations: [first], activeId: first.id };
}

export function useConversations() {
  const [state, setState] = useState(loadInitialState);

  // Save a moment after the last change (tokens arrive very quickly while streaming).
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* storage full or blocked */
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  const active = useMemo(
    () => state.conversations.find((c) => c.id === state.activeId) ?? state.conversations[0],
    [state]
  );

  // Newest first.
  const sorted = useMemo(
    () => [...state.conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [state.conversations]
  );

  /** Start a new chat. If an empty chat already exists, reuse it. */
  const startNew = useCallback(() => {
    setState((prev) => {
      const empty = prev.conversations.find((c) => c.messages.length === 0);
      if (empty) return { ...prev, activeId: empty.id };
      const fresh = blankConversation();
      return { conversations: [fresh, ...prev.conversations], activeId: fresh.id };
    });
  }, []);

  const select = useCallback((id) => setState((prev) => ({ ...prev, activeId: id })), []);

  const remove = useCallback((id) => {
    setState((prev) => {
      const rest = prev.conversations.filter((c) => c.id !== id);
      if (rest.length === 0) {
        const fresh = blankConversation();
        return { conversations: [fresh], activeId: fresh.id };
      }
      return {
        conversations: rest,
        activeId: prev.activeId === id ? rest[0].id : prev.activeId,
      };
    });
  }, []);

  /** Change a chat's messages: updateMessages(id, (oldList) => newList). */
  const updateMessages = useCallback((id, change) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === id ? { ...c, messages: change(c.messages), updatedAt: Date.now() } : c
      ),
    }));
  }, []);

  const rename = useCallback((id, title) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  }, []);

  return { conversations: sorted, active, startNew, select, remove, updateMessages, rename };
}
