import { readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const postsDir = "./collections/posts";
const destDir = "./public/search-thumbs";

if (!existsSync(postsDir)) {
  console.log("No collections/posts directory found — skipping thumb copy.");
  process.exit(0);
}

let copied = 0;
for (const slug of readdirSync(postsDir)) {
  const src = join(postsDir, slug, "thumb.webp");
  if (!existsSync(src)) continue;
  const dest = join(destDir, slug);
  mkdirSync(dest, { recursive: true });
  copyFileSync(src, join(dest, "thumb.webp"));
  copied++;
}

console.log(`Copied ${copied} thumbnail(s) to public/search-thumbs/`);
