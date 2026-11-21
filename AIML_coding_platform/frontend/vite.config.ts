import { defineConfig } from "vite";

export default defineConfig({
  worker: {
    format: "es"
  },
  server: {
    port: 5174,
    strictPort: true
  }
});