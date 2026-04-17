#!/usr/bin/env node
// Prepares a published post for manual cross-posting on third-party platforms.
// Generates normalised markdown plus metadata files under dist/crossposts/.
// This is content-prep only: it does not publish to any external API.
//
// Usage:
//   node scripts/prepare-crosspost.js
//   node scripts/prepare-crosspost.js <post-slug>
//   node scripts/prepare-crosspost.js --slug <post-slug> --platform generic
//   node scripts/prepare-crosspost.js --slug <post-slug> --platform devto --yes
//   node scripts/prepare-crosspost.js --slug <post-slug> --platform linkedin --yes
//
// Optional environment variables:
//   SITE_URL                Public site URL, e.g. https://sourcier.uk
//   CROSSPOST_MERMAID_MODE  image | code (defaults to image)
//   DEVTO_MERMAID_MODE      Used by the devto preset when set

import { createInterface } from "readline";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { basename, join, resolve } from "path";

const root = resolve(new URL(".", import.meta.url).pathname, "..");

const envFile = join(root, ".env");
if (existsSync(envFile) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envFile);
}

const siteBase = (process.env.SITE_URL ?? "https://sourcier.uk").replace(/\/$/, "");
const defaultMermaidMode = (
  process.env.CROSSPOST_MERMAID_MODE ??
  process.env.DEVTO_MERMAID_MODE ??
  "image"
).toLowerCase();

const PLATFORM_PRESETS = {
  generic: {
    label: "Generic",
    mermaidMode: defaultMermaidMode,
    tagNormaliser: (tags) => tags,
    copyVariantBuilder: buildDefaultTextVariants,
  },
  devto: {
    label: "Dev.to",
    mermaidMode: (process.env.DEVTO_MERMAID_MODE ?? defaultMermaidMode).toLowerCase(),
    tagNormaliser: normaliseTagsForDevto,
    copyVariantBuilder: buildDefaultTextVariants,
  },
  kofi: {
    label: "Ko-fi",
    mermaidMode: defaultMermaidMode,
    tagNormaliser: (tags) => tags,
    copyVariantBuilder: buildKoFiTextVariants,
  },
  linkedin: {
    label: "LinkedIn",
    mermaidMode: defaultMermaidMode,
    tagNormaliser: (tags) => tags,
    copyVariantBuilder: buildLinkedInTextVariants,
    hashtagLimit: 3,
  },
};

function parseCliArgs(argv) {
  let slug = null;
  let platform = "generic";
  let outputDir = null;
  let assumeYes = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log("Usage:");
      console.log("  node scripts/prepare-crosspost.js");
      console.log("  node scripts/prepare-crosspost.js <post-slug>");
      console.log("  node scripts/prepare-crosspost.js --slug <post-slug> --platform generic");
      console.log("  node scripts/prepare-crosspost.js --slug <post-slug> --platform devto --yes");
      console.log("  node scripts/prepare-crosspost.js --slug <post-slug> --platform linkedin --yes");
      console.log("");
      console.log("Options:");
      console.log("  --slug <post-slug>      Published post slug to prepare");
      console.log("  --platform <name>      generic | devto | kofi | linkedin");
      console.log("  --output-dir <path>    Custom output directory");
      console.log("  --yes                  Skip confirmation prompt");
      process.exit(0);
    }

    if (arg === "--slug") {
      slug = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--platform") {
      platform = (argv[index + 1] ?? "").toLowerCase();
      index += 1;
      continue;
    }

    if (arg === "--output-dir") {
      outputDir = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--yes") {
      assumeYes = true;
      continue;
    }

    if (arg.startsWith("--")) {
      console.error(`Error: Unknown argument '${arg}'.`);
      console.error("Use --help to see supported options.");
      process.exit(1);
    }

    if (!slug) {
      slug = arg;
      continue;
    }

    console.error(`Error: Unexpected positional argument '${arg}'.`);
    process.exit(1);
  }

  return { slug, platform, outputDir, assumeYes };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split(/\r?\n/)) {
    const simpleField = line.match(/^(\w+):\s*["'>]?(.*?)["']?\s*$/);
    if (simpleField) {
      result[simpleField[1]] = simpleField[2].trim();
    }
  }

  const descBlock = yaml.match(/^description:\s*>-?\r?\n((?:[ \t]+.+\r?\n?)*)/m);
  if (descBlock) {
    result.description = descBlock[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ");
  }

  const tagsMatch = yaml.match(/^tags:\s*\[(.+?)\]/m);
  if (tagsMatch) {
    result.tags = tagsMatch[1]
      .split(",")
      .map((tag) => tag.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  const coverBlock = yaml.match(/^cover:\s*\r?\n((?:[ \t]+.+\r?\n?)*)/m);
  if (coverBlock) {
    const cover = {};
    for (const line of coverBlock[1].split(/\r?\n/)) {
      const coverField = line.match(/^[ \t]+(\w+):\s*["'>]?(.*?)["']?\s*$/);
      if (coverField) {
        cover[coverField[1]] = coverField[2].trim();
      }
    }
    if (Object.keys(cover).length > 0) {
      result.cover = cover;
    }
  }

  return result;
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

function normaliseTagsForDevto(tags = []) {
  return tags
    .map((tag) => tag.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, 4);
}

function escapeMarkdownLinkText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function makeUrlAbsolute(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${siteBase}${url}`;
  return url;
}

function buildOriginalPostLine(title, canonicalUrl) {
  return `> Original post: [${escapeMarkdownLinkText(title)}](${canonicalUrl})`;
}

function swapSvgExtension(url) {
  return url.replace(/\.svg(?=(?:\?[^)]*)?$)/i, ".png");
}

function makeImagesAbsolute(markdown, slug) {
  return markdown
    .replace(/\(\/post-images\//g, `(${siteBase}/post-images/`)
    .replace(
      /\(\.\/([^)]+\.(png|jpg|jpeg|gif|webp|svg))\)/g,
      `(${siteBase}/post-images/${slug}/$1)`,
    );
}

function normaliseSeriesCallout(line) {
  const match = line.match(
    /^<div class="series-callout"><span class="series-callout__label">([^<]+)<\/span><span class="series-callout__text">([\s\S]*?)<\/span><\/div>$/,
  );

  if (!match) return null;

  const label = match[1].trim();
  const text = match[2]
    .replace(/<a href="([^"]+)">([\s\S]*?)<\/a>/g, (_, href, linkText) => {
      return `[${escapeMarkdownLinkText(linkText)}](${makeUrlAbsolute(href)})`;
    })
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `> ${label}: ${text}`;
}

function toBase64Url(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normaliseFenceLanguage(info) {
  const token = info.trim().split(/\s+/)[0] ?? "";
  return /^[a-z0-9#+.-]+$/i.test(token) ? token.toLowerCase() : "";
}

function mermaidFallback(markdown, canonicalUrl, mermaidMode) {
  const diagram = markdown.trim();
  if (!diagram) return "";

  if (mermaidMode === "code") {
    return [
      `> Mermaid diagram is available in the canonical article: ${canonicalUrl}`,
      "",
      "```mermaid",
      diagram,
      "```",
    ].join("\n");
  }

  const encoded = toBase64Url(diagram);
  const imageUrl = `https://mermaid.ink/img/${encoded}`;

  return [
    `![Mermaid diagram](${imageUrl})`,
    "",
    `> Diagram fallback for cross-posting. View the canonical article for the full version: ${canonicalUrl}`,
  ].join("\n");
}

function svgFallback(alt, svgUrl, canonicalUrl) {
  const pngUrl = swapSvgExtension(svgUrl);

  return [
    `![${escapeMarkdownLinkText(alt)}](${pngUrl})`,
    "",
    `> Diagram fallback for cross-posting. View the canonical article for the original SVG: ${canonicalUrl}`,
  ].join("\n");
}

function normaliseSvgImage(line, canonicalUrl) {
  const match = line.match(/^!\[([^\]]*)\]\(([^)\s]+\.svg(?:\?[^)]*)?)\)$/i);
  if (!match) return null;

  const alt = match[1].trim() || "Diagram";
  const url = match[2];

  return svgFallback(alt, url, canonicalUrl);
}

function normaliseMarkdownForCrosspost(markdown, canonicalUrl, title, mermaidMode) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  const stats = {
    mermaidBlocks: 0,
    codeFencesNormalised: 0,
    seriesCalloutsNormalised: 0,
    svgImagesConverted: 0,
  };

  let inFence = false;
  let fenceMarker = "";
  let fenceInfo = "";
  let fenceLines = [];

  for (const line of lines) {
    if (!inFence) {
      const open = line.match(/^(`{3,})(.*)$/);
      if (!open) {
        const seriesCallout = normaliseSeriesCallout(line);
        if (seriesCallout) {
          stats.seriesCalloutsNormalised += 1;
          output.push(seriesCallout);
          continue;
        }

        const svgImage = normaliseSvgImage(line, canonicalUrl);
        if (svgImage) {
          stats.svgImagesConverted += 1;
          output.push(svgImage);
          continue;
        }

        output.push(line);
        continue;
      }

      inFence = true;
      fenceMarker = open[1];
      fenceInfo = open[2] ?? "";
      fenceLines = [];
      continue;
    }

    const trimmed = line.trim();
    const isFenceClose =
      trimmed.startsWith(fenceMarker) &&
      /^`+$/.test(trimmed) &&
      trimmed.length >= fenceMarker.length;

    if (!isFenceClose) {
      fenceLines.push(line);
      continue;
    }

    const rawCode = fenceLines.join("\n");
    const language = normaliseFenceLanguage(fenceInfo);

    if (language === "mermaid") {
      stats.mermaidBlocks += 1;
      output.push(mermaidFallback(rawCode, canonicalUrl, mermaidMode));
    } else {
      if (fenceInfo.trim()) stats.codeFencesNormalised += 1;
      output.push(language ? `\`\`\`${language}` : "\`\`\`");
      output.push(rawCode);
      output.push("\`\`\`");
    }

    inFence = false;
    fenceMarker = "";
    fenceInfo = "";
    fenceLines = [];
  }

  if (inFence) {
    output.push(`${fenceMarker}${fenceInfo}`);
    output.push(...fenceLines);
  }

  return {
    markdown: `${buildOriginalPostLine(title, canonicalUrl)}\n\n${output.join("\n").trimStart()}`,
    stats,
  };
}

function buildThumbnailUrl(slug, cover) {
  const thumbnail = cover?.thumbnail?.trim();
  if (!thumbnail) return null;
  if (/^https?:\/\//i.test(thumbnail)) return thumbnail;
  if (thumbnail.startsWith("/")) return `${siteBase}${thumbnail}`;
  const fileName = thumbnail.startsWith("./") ? thumbnail.slice(2) : basename(thumbnail);
  return `${siteBase}/search-thumbnails/${slug}/${fileName}`;
}

function normaliseWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function truncateText(value, maxLength) {
  const text = normaliseWhitespace(value);
  if (!text || text.length <= maxLength) return text;

  const shortened = text.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const trimmed = lastSpace > Math.floor(maxLength * 0.6)
    ? shortened.slice(0, lastSpace)
    : shortened;

  return `${trimmed.trimEnd()}…`;
}

function toHashtag(tag) {
  const words = String(tag ?? "")
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);

  if (words.length === 0) return "";

  return `#${words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")}`;
}

function buildHashtagLine(tags = [], limit = tags.length) {
  return tags
    .map(toHashtag)
    .filter(Boolean)
    .slice(0, limit)
    .join(" ");
}

function joinCopyBlocks(parts) {
  return parts
    .map((part) => normaliseWhitespace(part))
    .filter(Boolean)
    .join("\n\n");
}

function buildDefaultTextVariants(post) {
  const summary = post.description || post.subTitle || "";
  const subtitle = post.subTitle && post.subTitle !== summary ? post.subTitle : "";

  return {
    short: joinCopyBlocks([
      post.title,
      truncateText(summary, 140),
      post.canonicalUrl,
    ]),
    medium: joinCopyBlocks([
      post.title,
      summary,
      `Original post: ${post.canonicalUrl}`,
    ]),
    long: joinCopyBlocks([
      post.title,
      subtitle,
      summary,
      `Original post: ${post.canonicalUrl}`,
    ]),
  };
}

function buildKoFiTextVariants(post) {
  const summary = post.description || post.subTitle || "";
  const subtitle = post.subTitle && post.subTitle !== summary ? post.subTitle : "";

  return {
    short: joinCopyBlocks([
      post.title,
      truncateText(summary, 140),
      `Read the full post: ${post.canonicalUrl}`,
    ]),
    medium: joinCopyBlocks([
      `New post on Sourcier: ${post.title}`,
      summary,
      `Read the full post: ${post.canonicalUrl}`,
    ]),
    long: joinCopyBlocks([
      `I just published a new post on Sourcier.`,
      post.title,
      subtitle,
      summary,
      `Read the full post: ${post.canonicalUrl}`,
    ]),
  };
}

function buildLinkedInTextVariants(post, preset) {
  const summary = post.description || post.subTitle || "";
  const subtitle = post.subTitle && post.subTitle !== summary ? post.subTitle : "";
  const hashtags = buildHashtagLine(post.tags, preset.hashtagLimit ?? 3);

  return {
    short: joinCopyBlocks([
      `New post: ${post.title}`,
      truncateText(summary, 180),
      post.canonicalUrl,
      hashtags,
    ]),
    medium: joinCopyBlocks([
      `I just published a new post on Sourcier: ${post.title}`,
      summary,
      `Read it here: ${post.canonicalUrl}`,
      hashtags,
    ]),
    long: joinCopyBlocks([
      `I just published a new post on Sourcier.`,
      post.title,
      subtitle,
      summary,
      `Read it here: ${post.canonicalUrl}`,
      hashtags,
    ]),
  };
}

function buildTextVariants(post, preset) {
  return preset.copyVariantBuilder(post, preset);
}

function printTextVariants(textVariants) {
  for (const [variantName, text] of Object.entries(textVariants)) {
    console.log(`── ${variantName.toUpperCase()} ──`);
    console.log(text);
    console.log();
  }
}

function loadPost(slug, preset) {
  const filePath = join(root, "collections", "posts", slug, "index.md");
  let raw;

  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    throw new Error(`Post not found: collections/posts/${slug}/index.md`);
  }

  const frontmatter = parseFrontmatter(raw);
  if (!frontmatter.title) {
    throw new Error(`No title found in frontmatter for: ${slug}`);
  }

  const title = frontmatter.title.replace(/^["']|["']$/g, "");
  const canonicalUrl = `${siteBase}/blog/${slug}`;
  const markdownBody = makeImagesAbsolute(stripFrontmatter(raw), slug);
  const normalised = normaliseMarkdownForCrosspost(
    markdownBody,
    canonicalUrl,
    title,
    preset.mermaidMode,
  );

  const post = {
    slug,
    platform: preset.label,
    title,
    subTitle: frontmatter.subTitle || "",
    description: frontmatter.description || frontmatter.subTitle || "",
    tags: preset.tagNormaliser(frontmatter.tags ?? []),
    draft: frontmatter.draft === "true",
    pubDate: frontmatter.pubDate ? new Date(frontmatter.pubDate) : null,
    canonicalUrl,
    body: normalised.markdown,
    thumbnailUrl: buildThumbnailUrl(slug, frontmatter.cover),
    coverAlt: frontmatter.cover?.alt || "",
    transformStats: normalised.stats,
  };

  post.textVariants = buildTextVariants(post, preset);
  post.shareText = post.textVariants.medium;
  return post;
}

function listPostIds() {
  const postsDir = join(root, "collections", "posts");
  return readdirSync(postsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      try {
        const content = readFileSync(join(postsDir, entry.name, "index.md"), "utf8");
        const frontmatter = parseFrontmatter(content);
        return {
          id: entry.name,
          pubDate: frontmatter.pubDate ? new Date(frontmatter.pubDate) : new Date(0),
          isDraft: frontmatter.draft === "true",
          isFuture: frontmatter.pubDate ? new Date(frontmatter.pubDate) > new Date() : false,
        };
      } catch {
        return null;
      }
    })
    .filter((post) => post && !post.isDraft && !post.isFuture)
    .sort((left, right) => right.pubDate - left.pubDate)
    .map((post) => post.id);
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolvePrompt) => {
    rl.question(question, (answer) => {
      rl.close();
      resolvePrompt(answer.trim());
    });
  });
}

const { slug: cliSlug, platform, outputDir, assumeYes } = parseCliArgs(
  process.argv.slice(2),
);

const preset = PLATFORM_PRESETS[platform];
if (!preset) {
  console.error(`Error: Unsupported platform '${platform}'.`);
  console.error(`Supported platforms: ${Object.keys(PLATFORM_PRESETS).join(", ")}`);
  process.exit(1);
}

const postIds = listPostIds();
if (postIds.length === 0) {
  console.log("\nNo published posts found.");
  process.exit(0);
}

let slug = cliSlug;

if (!slug) {
  console.log("\nPublished posts (newest first):");
  postIds.forEach((postId, index) => {
    console.log(`  ${String(index + 1).padStart(2)}. ${postId}`);
  });
  console.log();

  const input = await prompt("Enter post slug or number: ");
  if (!input) {
    console.error("Aborted.");
    process.exit(1);
  }

  slug = /^\d+$/.test(input) ? postIds[Number.parseInt(input, 10) - 1] : input;
}

if (!slug || !postIds.includes(slug)) {
  console.error(`Post not found or not published: ${cliSlug ?? slug}`);
  process.exit(1);
}

let post;

try {
  post = loadPost(slug, preset);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const targetDir = outputDir
  ? resolve(root, outputDir)
  : join(root, "dist", "crossposts", slug, platform);

console.log("\n─────────────────────────────────────────");
console.log(`  Platform     : ${preset.label}`);
console.log(`  Title        : ${post.title}`);
console.log(`  Canonical URL: ${post.canonicalUrl}`);
console.log(`  Tags         : ${post.tags.join(", ") || "(none)"}`);
console.log(
  `  Description  : ${post.description.slice(0, 80)}${post.description.length > 80 ? "…" : ""}`,
);
console.log(`  Mermaid      : ${post.transformStats.mermaidBlocks} converted (${preset.mermaidMode} mode)`);
console.log(`  Code fences  : ${post.transformStats.codeFencesNormalised} normalised`);
console.log(`  Series notes : ${post.transformStats.seriesCalloutsNormalised} normalised`);
console.log(`  SVG images   : ${post.transformStats.svgImagesConverted} converted to PNG fallbacks`);
console.log(`  Thumbnail    : ${post.thumbnailUrl ?? "(none)"}`);
console.log(`  Output dir   : ${targetDir}`);
console.log("─────────────────────────────────────────\n");

printTextVariants(post.textVariants);

if (!assumeYes) {
  const confirm = await prompt("Write cross-post files? [y/N] ");
  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log("Aborted.");
    process.exit(0);
  }
}

mkdirSync(targetDir, { recursive: true });

const payload = {
  slug: post.slug,
  platform,
  platformLabel: preset.label,
  title: post.title,
  subTitle: post.subTitle,
  description: post.description,
  canonicalUrl: post.canonicalUrl,
  tags: post.tags,
  pubDate: post.pubDate?.toISOString() ?? null,
  thumbnailUrl: post.thumbnailUrl,
  coverAlt: post.coverAlt,
  textVariants: post.textVariants,
  shareText: post.shareText,
  transformStats: post.transformStats,
  bodyMarkdown: post.body,
};

writeFileSync(join(targetDir, "body.md"), `${post.body}\n`);
writeFileSync(join(targetDir, "text-short.txt"), `${post.textVariants.short}\n`);
writeFileSync(join(targetDir, "text-medium.txt"), `${post.textVariants.medium}\n`);
writeFileSync(join(targetDir, "text-long.txt"), `${post.textVariants.long}\n`);
writeFileSync(join(targetDir, "share.txt"), `${post.shareText}\n`);
writeFileSync(join(targetDir, "crosspost.json"), `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${join(targetDir, "body.md")}`);
console.log(`Wrote ${join(targetDir, "text-short.txt")}`);
console.log(`Wrote ${join(targetDir, "text-medium.txt")}`);
console.log(`Wrote ${join(targetDir, "text-long.txt")}`);
console.log(`Wrote ${join(targetDir, "share.txt")}`);
console.log(`Wrote ${join(targetDir, "crosspost.json")}`);
