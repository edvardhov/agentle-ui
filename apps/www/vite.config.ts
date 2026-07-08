import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@registry": resolve(__dirname, "../../packages/agentle-ui/registry"),
      "react-markdown": resolve(__dirname, "node_modules/react-markdown"),
      "remark-gfm": resolve(__dirname, "node_modules/remark-gfm"),
    },
  },
});
