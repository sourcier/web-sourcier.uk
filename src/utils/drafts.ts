// Drafts are hidden by default. Run `pnpm dev:with-drafts` to show them.
// Also enabled in production when SHOW_DRAFTS=true (used by the preview branch deploy).
export const showDrafts: boolean = import.meta.env.SHOW_DRAFTS === "true";

// Returns true for posts that should be visible at build/request time.
// Hides drafts (unless showDrafts) and posts whose pubDate is in the future.
export function isPublished(post: { data: { draft: boolean; pubDate: Date } }): boolean {
  if (showDrafts) return true;
  if (post.data.draft) return false;
  return post.data.pubDate <= new Date();
}
