// Drafts are hidden by default. Run `pnpm dev:with-drafts` to show them.
export const showDrafts: boolean =
  import.meta.env.DEV && import.meta.env.SHOW_DRAFTS === "true";
