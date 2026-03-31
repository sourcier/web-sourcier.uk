import type { Config, Context } from "@netlify/edge-functions";

const COOKIE_NAME = "preview_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function computeToken(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("preview_authenticated"),
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );
}

function sanitizeRedirect(redirect: string, origin: string): string {
  // Prevent open redirects — only allow same-origin paths
  try {
    const target = new URL(redirect, origin);
    if (target.origin !== origin) return "/";
    return target.pathname + target.search;
  } catch {
    return "/";
  }
}

export default async function previewAuth(request: Request, context: Context) {
  const passcode = Netlify.env.get("PREVIEW_PASSCODE");

  // No passcode configured — pass through (production/other contexts unaffected)
  if (!passcode) return context.next();

  const url = new URL(request.url);
  const expectedToken = await computeToken(passcode);
  const cookies = parseCookies(request.headers.get("cookie") ?? "");

  if (cookies[COOKIE_NAME] === expectedToken) {
    return context.next();
  }

  if (request.method === "POST") {
    const body = await request.formData();
    const submitted = body.get("code")?.toString() ?? "";

    if (submitted === passcode) {
      const redirectTo = sanitizeRedirect(
        url.searchParams.get("redirect") ?? "/",
        url.origin,
      );
      const response = new Response(null, {
        status: 302,
        headers: { location: redirectTo },
      });
      response.headers.append(
        "set-cookie",
        `${COOKIE_NAME}=${expectedToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}; Path=/`,
      );
      return response;
    }

    return new Response(renderForm(url, true), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response(renderForm(url, false), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export const config: Config = { path: "/*" };

function renderForm(url: URL, failed: boolean): string {
  const redirect = encodeURIComponent(url.pathname + url.search);
  const errorHtml = failed
    ? `<p class="error" role="alert">Incorrect code — try again.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview access — Sourcier</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: #0f0f0f;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 2rem;
      width: min(360px, 90vw);
    }
    h1 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .hint { font-size: 0.875rem; color: #888; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.8rem; color: #aaa; margin-bottom: 0.4rem; }
    input[type="password"] {
      width: 100%;
      padding: 0.55rem 0.75rem;
      background: #0f0f0f;
      border: 1px solid ${failed ? "#c0392b" : "#333"};
      border-radius: 4px;
      color: #f0f0f0;
      font-size: 0.9rem;
      outline: none;
    }
    input[type="password"]:focus { border-color: #e8006a; }
    .error { font-size: 0.8rem; color: #c0392b; margin-top: 0.4rem; }
    button {
      display: block;
      width: 100%;
      margin-top: 1rem;
      padding: 0.6rem;
      background: #e8006a;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 0.9rem;
      cursor: pointer;
    }
    button:hover { background: #c0005a; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Preview access</h1>
    <p class="hint">This is a private preview. Enter the access code to continue.</p>
    <form method="POST" action="/?redirect=${redirect}">
      <label for="code">Access code</label>
      <input type="password" id="code" name="code" autocomplete="off" autofocus>
      ${errorHtml}
      <button type="submit">Continue</button>
    </form>
  </div>
</body>
</html>`;
}
