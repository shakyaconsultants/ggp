import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "https://gg.shakyaconsultants.com",
        changeOrigin: true,
        secure: true,
      },
      "/ws": {
        target: "https://gg.shakyaconsultants.com",
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
