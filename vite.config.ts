import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Prevent code splitting for content scripts
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
