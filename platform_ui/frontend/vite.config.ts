
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"],
  },

  server: {
    port: 5175,
    strictPort: true,

    fs: {
      allow: [
        fileURLToPath(new URL("../../", import.meta.url)),
      ],
    },

    proxy: {
      "/api/learning-lab": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

      "/chat": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },

  worker: {
    format: "es",
  },
});
