import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  
  // Add these configurations for WebRTC and Socket.io
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
    exclude: ['simple-peer'], // Exclude if you're using native WebRTC
  },
  server: {
    port: 5173,
    host: true, // Allow external access
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
      // Add polyfills for Node.js modules used by WebRTC libraries
      external: [],
    },
  },
});