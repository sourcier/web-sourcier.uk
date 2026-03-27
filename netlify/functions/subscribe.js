// Adds a subscriber to the Resend contacts list and assigns them to a segment.
//
// Required environment variables (Netlify → Site configuration → Env vars):
//   RESEND_API_KEY       — API key from https://resend.com
//   RESEND_SEGMENT_ID    — ID of the Resend segment to add contacts to

const ALLOWED_ORIGIN = process.env.SITE_URL?.replace(/\/$/, "") ?? "";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const handler = async (event) => {
  const origin = event.headers["origin"] ?? "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN || origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!apiKey || !segmentId) {
    console.error("subscribe: RESEND_API_KEY or RESEND_SEGMENT_ID is not set");
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Server configuration error" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const honeypot = body.website ?? "";

  if (honeypot) {
    // Bot filled the honeypot — silently accept to avoid revealing the check
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true }),
    };
  }

  if (!email || !isValidEmail(email)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "A valid email address is required" }),
    };
  }

  const res = await fetch(`https://api.resend.com/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`subscribe: Resend API error ${res.status}: ${errorBody}`);
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Could not subscribe. Please try again later.",
      }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ success: true }),
  };
};
