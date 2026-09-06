import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const ROOT = import.meta.dirname;
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

function stripDemoImages(): Plugin {
  return {
    name: "zaylist-strip-demo-images",
    generateBundle(_opts, bundle) {
      const paths = /(?:\/demo\/|\/brand\/)[^"' )\s]+/g;
      for (const item of Object.values(bundle)) {
        if (item.type === "chunk") item.code = item.code.replace(paths, PIXEL);
        else if (item.type === "asset" && typeof item.source === "string") {
          item.source = item.source.replace(paths, PIXEL);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripDemoImages(), viteSingleFile()],
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
    assetsInlineLimit: 200_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: join(ROOT, "offline/index.html"),
    },
  },
});
