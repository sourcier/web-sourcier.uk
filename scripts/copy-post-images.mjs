import { readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, extname } from "node:path";

const postsDir = "./collections/posts";
const destDir = "./public/post-images";

const COPY_EXTENSIONS = new Set([".svg"]);

for (const slug of readdirSync(postsDir)) {
  const slugDir = join(postsDir, slug);
  let entries;
  try {
    entries = readdirSync(slugDir);
  } catch {
    continue;
  }

  for (const file of entries) {
    if (!COPY_EXTENSIONS.has(extname(file).toLowerCase())) continue;
    const src = join(slugDir, file);
    if (!existsSync(src)) continue;
    const dest = join(destDir, slug);
    mkdirSync(dest, { recursive: true });
    copyFileSync(src, join(dest, file));
  }
}
