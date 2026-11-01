// vite.config.js - dev server settings.
// During development, requests to /api are forwarded to the Flask backend,
// so the browser only ever talks to one address (no CORS trouble).
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // >>> REPLACE IF NEEDED: the address of the Flask backend. <<<
  // Set VITE_BACKEND_URL in frontend/.env.local (see .env.example).
  const backend = env.VITE_BACKEND_URL || "http://localhost:5001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { "/api": { target: backend, changeOrigin: true } },
    },
  };
});
