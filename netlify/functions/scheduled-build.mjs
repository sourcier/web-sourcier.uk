// Triggers a Netlify build once per day at 07:00 UTC so future-dated posts
// go live automatically without a manual deploy.
//
// Required environment variable:
//   BUILD_HOOK_ID — the ID portion of your build hook URL
//                   Netlify → Site configuration → Build & deploy → Build hooks
//                   Create a hook named "Scheduled publish", copy the ID from the URL:
//                   https://api.netlify.com/build_hooks/<BUILD_HOOK_ID>
//
// The schedule is declared in netlify.toml under [functions."scheduled-build"].

export default async function handler() {
  const hookId = process.env.BUILD_HOOK_ID;

  if (!hookId) {
    console.error("BUILD_HOOK_ID is not set — skipping scheduled build.");
    return;
  }

  const url = `https://api.netlify.com/build_hooks/${encodeURIComponent(hookId)}`;
  const res = await fetch(url, { method: "POST" });

  if (res.ok) {
    console.log("Scheduled build triggered successfully.");
  } else {
    console.error(`Failed to trigger build: ${res.status} ${res.statusText}`);
  }
}
