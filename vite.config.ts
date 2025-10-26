import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  root,
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  server: {
    port: 5173,
    host: true,
    cors: true,
  },
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        interviewReport: resolve(root, "interviewReport", "index.html"),
      },
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
    exclude: ['firebase'],
  },
});