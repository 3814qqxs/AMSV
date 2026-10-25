import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { qrcode } from "vite-plugin-qrcode";

export default defineConfig({
  publicDir: "prod",
  plugins: [
    qrcode(),
    tsConfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
