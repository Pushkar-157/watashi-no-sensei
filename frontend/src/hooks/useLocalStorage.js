// useLocalStorage.js - like useState, but remembers the value in the browser.
import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue; // storage blocked or damaged: start fresh
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: the app still works, it just won't remember */
    }
  }, [key, value]);

  return [value, setValue];
}
