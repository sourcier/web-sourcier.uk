#!/usr/bin/env node
// Creates or updates the Sourcier welcome email template in Resend, then publishes it.
// Safe to run multiple times — it updates the existing template when it already exists.
//
// Usage:
//   RESEND_API_KEY=re_xxx node scripts/create-welcome-template.js
//
// After the first run, copy the template ID printed to stdout and set it as:
//   RESEND_WELCOME_TEMPLATE_ID=<id>   (Netlify → Site configuration → Env vars)

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("Error: RESEND_API_KEY environment variable is required.");
  process.exit(1);
}

const TEMPLATE_NAME = "Sourcier welcome email";
const TEMPLATE_ALIAS = "sourcier-welcome";
const RESEND_API = "https://api.resend.com";

// Triple-brace variables are rendered unescaped by Resend's template engine.
const templateHtml = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:2rem 1.5rem;color:#0f0f0f">
  <p style="font-size:1.5rem;font-weight:800;text-transform:uppercase;letter-spacing:0.02em;margin:0 0 1rem">Welcome to Sourcier</p>
  <p style="margin:0 0 1rem;line-height:1.6">Thanks for signing up. You'll get an email whenever I publish something new — engineering deep-dives, lessons from the field, and the occasional opinion.</p>
  <p style="margin:0 0 1.5rem;line-height:1.6">In the meantime, browse the <a href="{{{BLOG_URL}}}" style="color:#e8006a">blog</a> to see what's already there.</p>
  <p style="margin:0;color:#6b6b6b;font-size:0.875rem">You can unsubscribe at any time by replying to this email.</p>
</div>`;

async function resendRequest(path, method, body) {
  const res = await fetch(`${RESEND_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Resend API ${method} ${path} failed (${res.status}): ${JSON.stringify(json)}`
    );
  }

  return json;
}

const templatePayload = {
  name: TEMPLATE_NAME,
  alias: TEMPLATE_ALIAS,
  subject: "You're subscribed to Sourcier",
  html: templateHtml,
  variables: [
    {
      key: "BLOG_URL",
      type: "string",
      fallbackValue: "https://sourcier.uk/blog",
    },
  ],
};

async function main() {
  // Check whether the template already exists by its alias.
  const existing = await fetch(`${RESEND_API}/templates/${TEMPLATE_ALIAS}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  let templateId;

  if (existing.ok) {
    const data = await existing.json();
    templateId = data.id;
    console.log(`Template found (id: ${templateId}) — updating…`);
    await resendRequest(`/templates/${templateId}`, "PATCH", templatePayload);
    console.log("Template updated.");
  } else if (existing.status === 404) {
    console.log("Template not found — creating…");
    const created = await resendRequest("/templates", "POST", templatePayload);
    templateId = created.id;
    console.log(`Template created (id: ${templateId}).`);
  } else {
    const body = await existing.text();
    throw new Error(`Resend API GET /templates/${TEMPLATE_ALIAS} failed (${existing.status}): ${body}`);
  }

  console.log("Publishing template…");
  await resendRequest(`/templates/${templateId}/publish`, "POST");

  console.log(`\nDone! Set this in your Netlify env vars:\n`);
  console.log(`  RESEND_WELCOME_TEMPLATE_ID=${templateId}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
