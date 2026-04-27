/**
 * Downloads a cover image from Unsplash for a blog post.
 *
 * Fetches photo metadata via Unsplash oEmbed (no API key needed), downloads
 * at 1920px width, processes through sharp to produce a WebP, and outputs a
 * ready-to-paste frontmatter snippet.
 *
 * Accepts a full Unsplash photo URL (including slug-style) or a bare photo ID:
 *   https://unsplash.com/photos/a-building-with-a-sign-6ZT9qHUnesQ
 *   6ZT9qHUnesQ
 *
 * Usage:
 *   node scripts/download-cover-image.mjs <slug> <photo-url-or-id>
 *   node scripts/download-cover-image.mjs <slug> <photo-url-or-id> --alt "Description"
 *   node scripts/download-cover-image.mjs <slug> <photo-url-or-id> --force
 *   node scripts/download-cover-image.mjs <slug> <photo-url-or-id> --dry-run
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { input, select } from "@inquirer/prompts";

const POSTS_DIR = "./collections/posts";
const UTM = "utm_source=sourcier_uk&utm_medium=referral";

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForce = args.includes("--force");

const altFlagIndex = args.indexOf("--alt");
const altText = altFlagIndex !== -1 ? (args[altFlagIndex + 1] ?? null) : null;

const skipIndices = new Set();
args.forEach((arg, i) => {
  if (arg === "--dry-run" || arg === "--force") skipIndices.add(i);
  if (arg === "--alt") {
    skipIndices.add(i);
    skipIndices.add(i + 1);
  }
});
const positional = args.filter((_, i) => !skipIndices.has(i));
let [slug, photoInput] = positional;

if (!slug) {
  const postDirs = readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  slug = await select({
    message: "Select a post:",
    choices: postDirs.map((d) => ({ value: d })),
  }).catch(() => process.exit(0));
}

if (!photoInput) {
  photoInput = await input({
    message: "Unsplash photo URL or ID:",
    validate: (v) => v.trim() !== "" || "A photo URL or ID is required.",
  }).catch(() => process.exit(0));
}

function extractPhotoId(input) {
  // Handle slug-style URLs: /photos/description-words-PHOTOID
  // The ID is the last hyphen-separated segment (alphanumeric, mixed case)
  const path = input.replace(/^https?:\/\/unsplash\.com\/photos\//, "");
  const segments = path.split("-");
  // The last segment is always the ID if it looks like a short alphanumeric code
  const last = segments[segments.length - 1];
  return last && /^[a-zA-Z0-9_]{6,}$/.test(last) ? last : path;
}

async function fetchPhotoMeta(photoId) {
  // Unsplash's internal API — no key needed, returns full photo data including CDN URLs
  const response = await fetch(`https://unsplash.com/napi/photos/${photoId}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Could not fetch photo metadata (${response.status} ${response.statusText}) — verify the photo ID is correct: ${photoId}`,
    );
  }

  const data = await response.json();

  const rawCdnUrl = data.urls?.raw;
  if (!rawCdnUrl) {
    throw new Error("Photo metadata did not include a CDN URL.");
  }

  return {
    rawCdnUrl,
    photographerName: data.user?.name ?? null,
    authorUrl: data.user?.links?.html ?? null,
    altDescription: data.alt_description ?? null,
  };
}

async function main() {
  const photoId = extractPhotoId(photoInput);

  console.log(`Slug:     ${slug}`);
  console.log(`Photo ID: ${photoId}`);
  console.log("\nFetching photo metadata...");

  const { rawCdnUrl, photographerName, authorUrl, altDescription } =
    await fetchPhotoMeta(photoId);

  // Strip existing query params then add our own for download
  const imageUrl = `${rawCdnUrl.split("?")[0]}?w=1920&fit=max&fm=webp&q=85`;

  // Always use the canonical short URL in outbound links
  const canonicalPhotoUrl = `https://unsplash.com/photos/${photoId}`;
  const unsplashPhotoUrl = `${canonicalPhotoUrl}?${UTM}`;

  const photographerUrl = authorUrl
    ? `${authorUrl.split("?")[0]}?${UTM}`
    : unsplashPhotoUrl;

  const resolvedName = photographerName ?? "TODO: photographer name";
  const resolvedAlt =
    altText ?? altDescription ?? `Photo by ${resolvedName} on Unsplash`;

  if (photographerName) {
    console.log(`✓ Photographer: ${photographerName}`);
  } else {
    console.log(
      "⚠ Photographer name not found — update the credits frontmatter manually.",
    );
  }

  const postDir = join(POSTS_DIR, slug);
  const outputPath = join(postDir, `${slug}-cover.webp`);

  if (existsSync(outputPath) && !isForce && !isDryRun) {
    console.error(
      `\nError: ${outputPath} already exists. Use --force to overwrite.`,
    );
    process.exit(1);
  }

  if (isDryRun) {
    console.log("\n[DRY RUN] Would download:");
    console.log(`  Source: ${imageUrl}`);
    console.log(`  Output: ${outputPath}`);
  } else {
    if (!existsSync(postDir)) {
      mkdirSync(postDir, { recursive: true });
    }

    console.log("\nDownloading image...");
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download image: ${imgResponse.status}`);
    }

    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    writeFileSync(outputPath, buffer);
    console.log(`✓ Saved: ${outputPath}`);
  }

  const frontmatter = [
    `cover:`,
    `  image: "./${slug}-cover.webp"`,
    `  alt: "${resolvedAlt}"`,
    `credits:`,
    `  - label: "Cover photo"`,
    `    name: "${resolvedName}"`,
    `    url: "${photographerUrl}"`,
    `    extra: 'via <a href="${unsplashPhotoUrl}">Unsplash</a>'`,
  ].join("\n");

  console.log("\n─────────────────────────────────────────────────");
  console.log("Suggested frontmatter:");
  console.log("─────────────────────────────────────────────────");
  console.log(frontmatter);
  console.log("─────────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
