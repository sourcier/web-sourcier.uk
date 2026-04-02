// Stores and retrieves emoji reaction counts for blog posts using Netlify Blobs.
//
// GET  /.netlify/functions/reactions?post=<slug>  → { heart: N, fire: N, bulb: N, clap: N }
// POST /.netlify/functions/reactions?post=<slug>  body: { reaction: "heart" }  → updated counts
//
// Local dev: requires NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID in .env
// Production: works automatically with no extra config

import { getStore } from "@netlify/blobs";

const REACTIONS = ["heart", "fire", "bulb", "clap"];
// Matches slugs like "deploying-astro-netlify" — prevents path traversal
const SLUG_RE = /^[a-z0-9-]+$/;

const CORS = {
  "Access-Control-Allow-Origin": process.env.SITE_URL?.replace(/\/$/, "") ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const postId = event.queryStringParameters?.post ?? "";
  if (!postId || !SLUG_RE.test(postId)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid post ID" }) };
  }

  const store = getStore("reactions");

  if (event.httpMethod === "GET") {
    const data = (await store.get(postId, { type: "json" })) ?? {};
    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const reaction = body.reaction;
    if (!REACTIONS.includes(reaction)) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid reaction" }) };
    }

    const data = (await store.get(postId, { type: "json" })) ?? {};
    data[reaction] = (data[reaction] ?? 0) + 1;
    await store.set(postId, JSON.stringify(data));

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  }

  return { statusCode: 405, headers: CORS, body: "Method not allowed" };
};
