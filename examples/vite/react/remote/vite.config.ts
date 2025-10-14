import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { expozr } from "@expozr/vite-adapter";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), expozr()],
  server: {
    port: 5001,
    cors: true,
  },
  build: {
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
