// Drafts are hidden by default. `pnpm dev` enables them locally via SHOW_DRAFTS=true.
// Also enabled in production when SHOW_DRAFTS=true (used by the preview branch deploy).
export const showDrafts: boolean = import.meta.env.SHOW_DRAFTS === "true";

type PublicationData = { draft: boolean; pubDate: Date };

export type PublicationStatus = "draft" | "scheduled" | "published";

function getPublicationData(
  input: { data: PublicationData } | PublicationData,
): PublicationData {
  return "data" in input ? input.data : input;
}

export function getPublicationStatus(
  input: { data: PublicationData } | PublicationData,
): PublicationStatus {
  const data = getPublicationData(input);

  if (data.draft) return "draft";
  if (data.pubDate > new Date()) return "scheduled";
  return "published";
}

export function isPubliclyPublished(post: {
  data: { draft: boolean; pubDate: Date };
}): boolean {
  return getPublicationStatus(post) === "published";
}

// Returns true for posts that should be visible at build/request time.
// Hides drafts (unless showDrafts) and posts whose pubDate is in the future.
export function isPublished(post: {
  data: { draft: boolean; pubDate: Date };
}): boolean {
  if (showDrafts) return true;
  return isPubliclyPublished(post);
}
