// text.js - small text helpers.

/** Turn the first message of a chat into a short sidebar title. */
export function makeTitle(text) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > 40 ? `${oneLine.slice(0, 40).trimEnd()}…` : oneLine || "New chat";
}

/** True if `model` is installed. "llama3.2" matches "llama3.2:latest". */
export function isModelInstalled(installed, model) {
  return installed.includes(model) || installed.includes(`${model}:latest`);
}
