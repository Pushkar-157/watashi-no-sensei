// useBackendStatus.js - checks (and keeps checking) that the backend and Ollama are up.
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStatus } from "../api/chatApi";
import { STATUS_POLL_MS } from "../config";
import { isModelInstalled } from "../utils/text";

// state: "checking" | "ready" | "ollama_down" | "backend_down"
const INITIAL = { state: "checking", models: [], defaultModel: "", message: "" };

export function useBackendStatus(selectedModel) {
  const [status, setStatus] = useState(INITIAL);

  const refresh = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus({
        state: data.ollama ? "ready" : "ollama_down",
        models: data.models ?? [],
        defaultModel: data.default_model ?? "",
        message: data.message ?? "",
      });
    } catch (err) {
      setStatus((prev) => ({ ...prev, state: "backend_down", message: err.message }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  // A helpful message when something needs fixing (null when all is well).
  const notice = useMemo(() => {
    if (status.state === "backend_down") {
      return { title: "The Sensei server is offline", text: status.message };
    }
    if (status.state === "ollama_down") {
      return { title: "Ollama is not running", text: status.message };
    }
    const model = selectedModel || status.defaultModel;
    if (status.state === "ready" && model && !isModelInstalled(status.models, model)) {
      return {
        title: `The model “${model}” isn’t installed`,
        text: `Run \`ollama pull ${model}\` in a terminal, or choose another model from the menu above.`,
      };
    }
    return null;
  }, [status, selectedModel]);

  return { status, notice, refresh };
}
