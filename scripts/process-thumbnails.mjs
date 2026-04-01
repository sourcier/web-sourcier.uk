/**
 * Generates 96×96 center-cropped WebP thumbnails for all posts that have
 * a cover image (*-cover.webp) but no <slug>-thumbnail.webp yet.
 *
 * Usage:
 *   node scripts/process-thumbnails.mjs            # skip existing thumbnails
 *   node scripts/process-thumbnails.mjs --force    # regenerate all thumbnails
 *   node scripts/process-thumbnails.mjs --dry-run  # preview without changes
 */

import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const POSTS_DIR = "./collections/posts";
const THUMB_SIZE = "96x96";

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

if (dryRun) console.log("Dry run — no files will be changed.\n");

let generated = 0;
let skipped = 0;

for (const slug of readdirSync(POSTS_DIR).sort()) {
  const dir = join(POSTS_DIR, slug);
  if (!statSync(dir).isDirectory()) continue;

  const cover = readdirSync(dir).find((f) => /-cover\.webp$/i.test(f));
  if (!cover) continue;

  const thumbPath = join(dir, `${slug}-thumbnail.webp`);
  if (existsSync(thumbPath) && !force) {
    skipped++;
    continue;
  }

  console.log(`${slug}: generating ${slug}-thumbnail.webp`);
  if (!dryRun) {
    execSync(
      `magick "${join(dir, cover)}" -resize ${THUMB_SIZE}^ -gravity Center -extent ${THUMB_SIZE} "${thumbPath}"`,

      { stdio: "inherit" }
    );
  }
  generated++;
}

console.log(`\nDone.`);
console.log(`  Thumbs generated: ${generated}`);
console.log(`  Skipped:          ${skipped}`);
if (dryRun) console.log(`\n(dry run — no changes made)`);
