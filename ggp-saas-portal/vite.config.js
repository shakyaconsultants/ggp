import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "https://ourganik.in",
        changeOrigin: true,
        secure: true,
      },
      "/ws": {
        target: "https://ourganik.in",
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
