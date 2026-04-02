#!/usr/bin/env node
// Cross-posts a blog post to Dev.to with a canonical URL pointing back to sourcier.uk.
// Reads post content from collections/posts/<slug>/index.md.
//
// Usage:
//   node scripts/crosspost-devto.js
//
// Required environment variables (set in .env or shell):
//   DEVTO_API_KEY  — API key from https://dev.to/settings/extensions → DEV Community API Keys
//   SITE_URL       — public URL of the site, e.g. https://sourcier.uk

import { createInterface } from "readline";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const root = resolve(new URL(".", import.meta.url).pathname, "..");

const envFile = join(root, ".env");
if (existsSync(envFile) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envFile);
}

const apiKey = process.env.DEVTO_API_KEY;
const siteBase = (process.env.SITE_URL ?? "https://sourcier.uk").replace(/\/$/, "");

if (!apiKey) {
  console.error("Error: DEVTO_API_KEY environment variable is required.");
  console.error("Get one at: https://dev.to/settings/extensions");
  process.exit(1);
}

// ── Frontmatter parser ────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};

  for (const line of yaml.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*["'>]?(.*?)["']?\s*$/);
    if (m) result[m[1]] = m[2].trim();
  }

  const descBlock = yaml.match(/^description:\s*>-?\r?\n((?:[ \t]+.+\r?\n?)*)/m);
  if (descBlock) {
    result.description = descBlock[1]
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");
  }

  // Parse tags array: tags: ["tag1", "tag2"]
  const tagsMatch = yaml.match(/^tags:\s*\[(.+?)\]/m);
  if (tagsMatch) {
    result.tags = tagsMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/^["']|["']$/g, ""));
  }

  return result;
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

// Dev.to tags: lowercase alphanumeric only, max 4
function normaliseTags(tags = []) {
  return tags
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, 4);
}

// Replace relative /post-images/ paths and ./image references with absolute URLs
function makeImagesAbsolute(markdown, slug) {
  return markdown
    .replace(/\(\/post-images\//g, `(${siteBase}/post-images/`)
    .replace(/\(\.\/([^)]+\.(png|jpg|jpeg|gif|webp|svg))\)/g, `(${siteBase}/post-images/${slug}/$1)`);
}

function loadPost(slug) {
  const filePath = join(root, "collections", "posts", slug, "index.md");
  let raw;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    throw new Error(`Post not found: collections/posts/${slug}/index.md`);
  }
  const fm = parseFrontmatter(raw);
  if (!fm.title) throw new Error(`No title found in frontmatter for: ${slug}`);
  return {
    title: fm.title.replace(/^["']|["']$/g, ""),
    description: fm.description || "",
    tags: normaliseTags(fm.tags),
    draft: fm.draft === "true",
    pubDate: fm.pubDate ? new Date(fm.pubDate) : null,
    body: makeImagesAbsolute(stripFrontmatter(raw), slug),
    canonicalUrl: `${siteBase}/blog/${slug}`,
  };
}

function listPostIds() {
  const postsDir = join(root, "collections", "posts");
  return readdirSync(postsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      try {
        const content = readFileSync(join(postsDir, d.name, "index.md"), "utf8");
        const fm = parseFrontmatter(content);
        return {
          id: d.name,
          pubDate: fm.pubDate ? new Date(fm.pubDate) : new Date(0),
          isDraft: fm.draft === "true",
        };
      } catch {
        return null;
      }
    })
    .filter((p) => p && !p.isDraft)
    .sort((a, b) => b.pubDate - a.pubDate)
    .map((p) => p.id);
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Select post ───────────────────────────────────────────────────────────────

const postIds = listPostIds();
if (postIds.length === 0) {
  console.log("\nNo published posts found.");
  process.exit(0);
}

console.log("\nPublished posts (newest first):");
postIds.forEach((id, i) => console.log(`  ${String(i + 1).padStart(2)}. ${id}`));
console.log();

const input = await prompt("Enter post slug or number: ");
if (!input) {
  console.error("Aborted.");
  process.exit(1);
}

const slug = /^\d+$/.test(input)
  ? postIds[parseInt(input, 10) - 1]
  : input;

if (!slug || !postIds.includes(slug)) {
  console.error(`Post not found: ${input}`);
  process.exit(1);
}

let post;
try {
  post = loadPost(slug);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

// ── Preview ───────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────");
console.log(`  Title        : ${post.title}`);
console.log(`  Canonical URL: ${post.canonicalUrl}`);
console.log(`  Tags         : ${post.tags.join(", ") || "(none)"}`);
console.log(`  Description  : ${post.description.slice(0, 80)}${post.description.length > 80 ? "…" : ""}`);
console.log(`  Body length  : ${post.body.length} chars`);
console.log("─────────────────────────────────────────\n");

const confirm = await prompt("Cross-post to Dev.to? [y/N] ");
if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
  console.log("Aborted.");
  process.exit(0);
}

// ── POST to Dev.to API ────────────────────────────────────────────────────────

console.log("\nPosting to Dev.to…");

const res = await fetch("https://dev.to/api/articles", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-key": apiKey,
  },
  body: JSON.stringify({
    article: {
      title: post.title,
      body_markdown: post.body,
      published: true,
      canonical_url: post.canonicalUrl,
      description: post.description,
      tags: post.tags,
    },
  }),
});

const data = await res.json();

if (!res.ok) {
  console.error(`\nDev.to API error (${res.status}):`, JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log(`\n✓ Published! View at: ${data.url}`);
console.log("  Dev.to article ID:", data.id);
console.log("\nNote: review the article on Dev.to and adjust any images or Mermaid");
console.log("diagrams that may not render. The canonical URL is set correctly.");
