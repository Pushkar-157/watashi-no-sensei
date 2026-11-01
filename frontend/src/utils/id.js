// id.js - makes a unique id for conversations and messages.
export function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for browsers on plain http addresses (not localhost).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
