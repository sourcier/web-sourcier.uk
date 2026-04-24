/** Strip Astro dev-mode attributes so snapshots are stable across machines and environments. */
export function normalizeHtml(html: string): string {
  return html
    .replace(/ data-astro-cid-[a-z0-9]+/g, "")
    .replace(/ data-astro-source-file="[^"]*"/g, "")
    .replace(/ data-astro-source-loc="[^"]*"/g, "")
    .trim();
}
