#!/usr/bin/env node
// Sends a "new post" broadcast email to all Resend subscribers.
// Reads post details from the frontmatter in collections/posts/<id>/index.md.
// Shows a console preview and asks for confirmation before sending.
//
// Usage:
//   node scripts/notify-new-post.js
//
// Reads RESEND_API_KEY, NOTIFY_FROM_EMAIL, and SITE_URL from a .env file in
// the project root (if present). Environment variables set in the shell take
// precedence over the .env file.

import { createInterface } from "readline";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const root = resolve(new URL(".", import.meta.url).pathname, "..");

// Load .env from the project root if it exists (Node 20.6+ built-in)
const envFile = join(root, ".env");
if (existsSync(envFile)) {
  // process.loadEnvFile is available from Node 20.12 / 21.7
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envFile);
  }
}

const apiKey = process.env.RESEND_API_KEY;
const segmentId = process.env.RESEND_SEGMENT_ID;
const topicId = process.env.RESEND_TOPIC_ID;
const siteBase = (process.env.SITE_URL ?? "https://sourcier.uk").replace(/\/$/, "");

if (!apiKey) {
  console.error("Error: RESEND_API_KEY environment variable is required.");
  process.exit(1);
}

if (!segmentId) {
  console.error("Error: RESEND_SEGMENT_ID environment variable is required.");
  process.exit(1);
}

// ── Frontmatter parser ────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};

  for (const line of yaml.split(/\r?\n/)) {
    // Only handle simple key: value lines (skip nested/multiline blocks)
    const m = line.match(/^(\w+):\s*["'>]?(.*?)["']?\s*$/);
    if (m) result[m[1]] = m[2].trim();
  }

  // Handle YAML block scalar for description (>- or >)
  const descBlock = yaml.match(
    /^description:\s*>-?\r?\n((?:[ \t]+.+\r?\n?)*)/m,
  );
  if (descBlock) {
    result.description = descBlock[1]
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");
  }

  return result;
}

function loadPost(postId) {
  const filePath = join(root, "collections", "posts", postId, "index.md");
  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    throw new Error(`Post not found: collections/posts/${postId}/index.md`);
  }
  const fm = parseFrontmatter(content);
  if (!fm.title) throw new Error(`No title found in frontmatter for post: ${postId}`);
  return {
    title:   fm.title.replace(/^["']|["']$/g, ""),
    excerpt: fm.description || fm.subTitle || "",
    url:     `${siteBase}/blog/${postId}`,
    draft:   fm.draft === "true",
  };
}

function listPostIds() {
  const postsDir = join(root, "collections", "posts");
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return readdirSync(postsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      try {
        const content = readFileSync(join(postsDir, d.name, "index.md"), "utf8");
        const fm = parseFrontmatter(content);
        const pubDate = fm.pubDate ? new Date(fm.pubDate).getTime() : 0;
        const isDraft = fm.draft === "true";
        return { id: d.name, pubDate, isDraft };
      } catch {
        return null;
      }
    })
    .filter((p) => p && !p.isDraft && p.pubDate >= oneWeekAgo)
    .sort((a, b) => b.pubDate - a.pubDate)
    .map((p) => p.id);
}

// ── Prompt helper ─────────────────────────────────────────────────────────────

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Ask for post ID ───────────────────────────────────────────────────────────

const postIds = listPostIds();
if (postIds.length === 0) {
  console.log("\nNo published posts found in the past week.");
  process.exit(0);
}
console.log("\nPosts published in the past week:");
postIds.forEach((id) => console.log(`  • ${id}`));
console.log();

const postId = await prompt("Enter post ID: ");
if (!postId) {
  console.error("Aborted — no post ID entered.");
  process.exit(1);
}

let post;
try {
  post = loadPost(postId);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

if (post.draft) {
  console.warn("\n⚠  Warning: this post is marked draft: true in its frontmatter.");
  const confirm = await prompt("Send anyway? [y/N] ");
  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log("Aborted.");
    process.exit(0);
  }
}

const { title, url, excerpt } = post;

const SUBJECT = `New post: ${title}`;
const FROM    = process.env.NOTIFY_FROM_EMAIL ?? "Roger @ Sourcier <hello@sourcier.uk>";
const RESEND_API = "https://api.resend.com";

function buildHtml() {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:2rem 1.5rem;color:#0f0f0f">
  <p style="margin:0 0 1.5rem;line-height:1.6">Hi — I just published something new on Sourcier.</p>
  <p style="font-size:1.5rem;font-weight:800;letter-spacing:-0.01em;margin:0 0 1rem;line-height:1.2">${title}</p>
  ${excerpt ? `<p style="margin:0 0 1.5rem;line-height:1.6;color:#444">${excerpt}</p>` : ""}
  <a href="${url}" style="display:inline-block;background:#e8006a;color:#fff;text-decoration:none;padding:0.65rem 1.5rem;font-weight:700;font-size:0.875rem;letter-spacing:0.04em;text-transform:uppercase">Read the post →</a>
  <p style="margin:1.5rem 0 0;line-height:1.6;color:#444">If it sparks any thoughts, I'd love to hear them — there's a comments section at the bottom of the post.</p>
  <p style="margin:1rem 0 0;line-height:1.6">— Roger</p>
  <hr style="margin:2rem 0;border:none;border-top:1px solid #e5e5e5">
  <p style="margin:0;color:#999;font-size:0.8125rem;line-height:1.5">
    You're receiving this because you subscribed at <a href="https://sourcier.uk" style="color:#999">sourcier.uk</a>.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#999">Unsubscribe</a>
  </p>
</div>`.trim();
}

function buildText() {
  return [
    "Hi — I just published something new on Sourcier.",
    "",
    title,
    "",
    excerpt ? excerpt : null,
    "",
    `Read it here: ${url}`,
    "",
    "If it sparks any thoughts, I'd love to hear them — there's a comments section at the bottom of the post.",
    "",
    "— Roger",
    "",
    "---",
    "You're receiving this because you subscribed at sourcier.uk.",
    "Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

function printPreview() {
  const divider = "─".repeat(60);
  console.log("\n" + divider);
  console.log("  EMAIL PREVIEW");
  console.log(divider);
  console.log(`  From:    ${FROM}`);
  console.log(`  Subject: ${SUBJECT}`);
  console.log(divider);
  console.log();
  for (const line of buildText().split("\n")) {
    console.log("  " + line);
  }
  console.log();
  console.log(divider + "\n");
}

async function sendBroadcast() {
  const createRes = await fetch(`${RESEND_API}/broadcasts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: title,
      from: FROM,
      subject: SUBJECT,
      html: buildHtml(),
      text: buildText(),
      segment_id: segmentId,
      ...(topicId ? { topic_id: topicId } : {}),
    }),
  });

  const created = await createRes.json().catch(() => ({}));
  if (!createRes.ok) {
    throw new Error(
      `Resend API error (${createRes.status}): ${JSON.stringify(created)}`,
    );
  }

  const sendRes = await fetch(`${RESEND_API}/broadcasts/${created.id}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const sent = await sendRes.json().catch(() => ({}));
  if (!sendRes.ok) {
    throw new Error(
      `Resend send error (${sendRes.status}): ${JSON.stringify(sent)}`,
    );
  }

  return created;
}

printPreview();

const answer = await prompt("Send this to all subscribers? [y/N] ");

if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
  console.log("Aborted — nothing was sent.");
  process.exit(0);
}

console.log("\nCreating broadcast…");
try {
  const broadcast = await sendBroadcast();
  console.log(`\n✓ Broadcast sent (id: ${broadcast.id})`);
  console.log("  Check your Resend dashboard to confirm delivery.");
} catch (err) {
  console.error("\nError:", err.message);
  process.exit(1);
}
