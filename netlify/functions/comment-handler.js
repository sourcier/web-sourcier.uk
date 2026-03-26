// Triggered by a Netlify form-submission webhook whenever a comment lands in
// the blog-comments queue. Sends an email notification containing the comment
// text and HMAC-signed approve / delete links.
//
// Required environment variables (Netlify → Site configuration → Env vars):
//   NETLIFY_ACCESS_TOKEN  — personal access token (already used by get-comments)
//   APPROVAL_SECRET       — random secret used to sign approve/delete tokens
//   SITE_URL              — public URL of the site, e.g. https://sourcier.uk
//   RESEND_API_KEY        — API key from https://resend.com (free tier is ample)
//   NOTIFY_FROM_EMAIL     — verified Resend sender address, e.g. comments@sourcier.uk
//   NOTIFY_EMAIL          — address to send the notification to
//
// Netlify webhook setup (one-time, done in the Netlify dashboard):
//   Forms → blog-comments → Form notifications → Add notification
//   → Outgoing webhook → URL: https://{your-site}/.netlify/functions/comment-handler

import crypto from "node:crypto";

function hmac(submissionId, action, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${submissionId}:${action}`)
    .digest("hex");
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const secret = process.env.APPROVAL_SECRET;
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFY_FROM_EMAIL;
  const toEmail = process.env.NOTIFY_EMAIL;

  if (!secret || !siteUrl || !resendApiKey || !fromEmail || !toEmail) {
    console.warn("comment-handler: missing environment variables — skipping notification");
    return { statusCode: 200, body: "OK" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid payload" };
  }

  const { id, data, created_at } = payload;
  if (!id || !data) {
    return { statusCode: 400, body: "Missing submission id or data" };
  }

  const approveToken = hmac(id, "approve", secret);
  const deleteToken = hmac(id, "delete", secret);
  const base = `${siteUrl}/.netlify/functions/approve-comment`;
  const approveUrl = `${base}?action=approve&id=${encodeURIComponent(id)}&token=${approveToken}`;
  const deleteUrl = `${base}?action=delete&id=${encodeURIComponent(id)}&token=${deleteToken}`;

  const submittedAt = created_at
    ? new Date(created_at).toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC"
    : "unknown time";

  const emailHtml = `
<p>New comment from <strong>${escapeHtml(data.name ?? "anonymous")}</strong>
on post <strong>${escapeHtml(data.postSlug ?? "(unknown)")}</strong>
at ${submittedAt}:</p>

<blockquote style="border-left:3px solid #e8006a;margin:1rem 0;padding:0.75rem 1.25rem;background:#f9f9f9;">
  ${escapeHtml(data.comment ?? "")}
</blockquote>

<p>
  <a href="${approveUrl}" style="background:#e8006a;color:#fff;padding:0.6rem 1.2rem;text-decoration:none;margin-right:0.5rem;">Approve</a>
  <a href="${deleteUrl}" style="background:#333;color:#fff;padding:0.6rem 1.2rem;text-decoration:none;">Delete</a>
</p>
<p style="font-size:0.8rem;color:#999;">These links are single-use and tied to this submission.</p>
`.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail,
      subject: `New comment: ${data.postSlug ?? "blog"} — ${data.name ?? "anonymous"}`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`comment-handler: Resend API error ${res.status}: ${body}`);
    return { statusCode: 502, body: "Failed to send notification" };
  }

  return { statusCode: 200, body: "OK" };
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
