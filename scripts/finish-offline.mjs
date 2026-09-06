#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist-offline");

function findHtml(dir) {
  if (!existsSync(dir)) return null;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) {
      const nested = findHtml(full);
      if (nested) return nested;
    } else if (name.name.endsWith(".html")) {
      return full;
    }
  }
  return null;
}

const html = findHtml(dist);
if (!html) {
  console.error("offline build produced no HTML");
  process.exit(1);
}
const src = readFileSync(html, "utf8");
if (src.includes('src="./') || src.includes('href="./assets')) {
  console.error("HTML still references external assets — single-file plugin failed");
  process.exit(1);
}
writeFileSync(join(root, "zaylist-offline.html"), src);
mkdirSync(join(root, "public"), { recursive: true });
copyFileSync(join(root, "zaylist-offline.html"), join(root, "public/zaylist-offline.html"));
console.log(`offline html ${Buffer.byteLength(src)} bytes → zaylist-offline.html`);
