import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: true,
  },
  define: {
    // Define environment variables for Walrus API
    'import.meta.env.VITE_WALRUS_API': JSON.stringify(process.env.VITE_WALRUS_API || "https://aggregator-mainnet.walrus.space/v1"),
    'import.meta.env.VITE_WALRUS_FALLBACK_API': JSON.stringify(process.env.VITE_WALRUS_FALLBACK_API || "https://api.walrus.gg/v1"),
    'import.meta.env.VITE_PACKAGE_ID': JSON.stringify(process.env.VITE_PACKAGE_ID || "0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799"),
  },
});
