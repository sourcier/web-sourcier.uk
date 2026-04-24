/** Strip Astro scoped-style hashes so snapshots stay stable when CSS changes. */
export function normalizeHtml(html: string): string {
  return html.replace(/ data-astro-cid-[a-z0-9]+/g, "").trim();
}
