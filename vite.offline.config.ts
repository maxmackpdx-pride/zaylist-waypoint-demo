import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const ROOT = import.meta.dirname;

function inlineChromeAssets(): Plugin {
  const files: Record<string, [string, string]> = {
    "/zaylist-wordmark.png": ["image/png", join(ROOT, "public/zaylist-wordmark.png")],
    "/brand/zaydark.svg": ["image/svg+xml", join(ROOT, "public/brand/zaydark.svg")],
    "/favicon.svg": ["image/svg+xml", join(ROOT, "public/favicon.svg")],
  };
  const table = new Map<string, string>();
  return {
    name: "zaylist-inline-chrome",
    buildStart() {
      for (const [url, [mime, file]] of Object.entries(files)) {
        table.set(url, `data:${mime};base64,${readFileSync(file).toString("base64")}`);
      }
    },
    generateBundle(_opts, bundle) {
      const paths = [...table.keys()].sort((a, b) => b.length - a.length);
      for (const item of Object.values(bundle)) {
        if (item.type !== "chunk") continue;
        for (const path of paths) item.code = item.code.split(path).join(table.get(path)!);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineChromeAssets(), viteSingleFile()],
  resolve: {
    alias: {
      "@": join(ROOT, "src"),
      "@tanstack/react-router": join(ROOT, "offline/router-stub.tsx"),
    },
  },
  define: {
    "import.meta.env.VITE_OFFLINE": JSON.stringify("1"),
  },
  publicDir: false,
  build: {
    outDir: join(ROOT, "dist-offline"),
    emptyOutDir: true,
    assetsInlineLimit: 400_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: join(ROOT, "offline/index.html"),
    },
  },
});
