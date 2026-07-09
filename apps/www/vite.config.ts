import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const registryRoot = resolve(__dirname, "../../packages/agentle-ui/registry");
const sharedCss = resolve(registryRoot, "shared/agentle.css");
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../../packages/agentle-ui/package.json"), "utf8"),
) as { version: string };

function resolveRegistryCss(): Plugin {
  return {
    name: "resolve-registry-css",
    resolveId(source, importer) {
      if (source !== "./agentle.css" || !importer?.includes("/registry/")) {
        return null;
      }
      return sharedCss;
    },
  };
}

export default defineConfig({
  plugins: [react(), resolveRegistryCss()],
  define: {
    __AGENTLE_UI_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "src") },
      { find: "@registry", replacement: registryRoot },
      { find: "react-markdown", replacement: resolve(__dirname, "node_modules/react-markdown") },
      { find: "remark-gfm", replacement: resolve(__dirname, "node_modules/remark-gfm") },
    ],
  },
});
