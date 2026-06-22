import { cp, mkdir, rm } from "node:fs/promises";

const output = new URL("../dist/", import.meta.url);
const root = new URL("../", import.meta.url);
const assets = [
  "index.html",
  "styles.css",
  "manifest.json",
  "service-worker.js",
  "src",
  "icons"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const asset of assets) {
  await cp(new URL(asset, root), new URL(asset, output), { recursive: true });
}

console.log("D4NOS built to dist/");
