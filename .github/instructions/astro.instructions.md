---
description: "Astro project-specific conventions for sourcier.uk (supplements the global Astro instructions)"
applyTo: "**/*.astro, **/*.ts, **/*.js, **/*.md, **/*.mdx"
---

# Astro: sourcier.uk Project Conventions

## Tech Stack

- **Astro 6** with Islands Architecture and Content Layer API
- **Styling:** Sass + Bulma CSS framework — `<style lang="scss">` in components, global styles in `src/styles/global.scss`
- **Content:** Markdown in `collections/posts/` (separate git repo), loaded via `glob()` in `src/content.config.ts`
- **Hosting:** Netlify (serverless functions, edge functions, scheduled builds)
- **Search:** Pagefind static site search, indexed after build

## Development Commands

```sh
pnpm dev              # Dev server with drafts (localhost:8888 via Netlify CLI)
pnpm dev:no-drafts    # Dev server without drafts
pnpm build            # Production build to dist/
pnpm search:index     # Full local Pagefind index rebuild
pnpm talk:playwright  # Regenerate the Playwright JavaScript London talk deck and companion cover/thumbnail assets
pnpm thumbnails:generate  # Generate <slug>-thumbnail.webp for any post with a cover but no thumbnail
pnpm thumbnails:copy      # Mirror <slug>-thumbnail.webp files to public/search-thumbnails/<slug>/
pnpm post-images:copy     # Mirror SVG files to public/post-images/<slug>/ and generate PNG fallbacks
```

`pnpm dev` and `pnpm search:index` automatically run `thumbnails:copy` and `post-images:copy` first.

## Project-Specific Styling

- Scoped styles use `<style lang="scss">`
- Global utilities (`.visually-hidden`, search modal styles) live in `src/styles/global.scss`
- Breakpoints: 640px (mobile/tablet), 768px (tablet/desktop)
- Primary colour: `--color-pink: #e8006a`
- `cover.thumbnail` in content schema is a plain string (not an Astro image) — bypasses filename hashing so the path stays stable

## UI Conventions

- Audience-navigation surfaces should call curated routes **guides**; prefer "guide" over "path" in headings, buttons, and supporting copy unless explicitly asked otherwise
- In compact stat cards, place the small uppercase label above the value; longer role or employer details belong in sidebar-style fact cards instead
- When something is launching soon, promote that status into a distinct badge or label instead of relying on paragraph copy alone
- Draft and scheduled posts are distinct preview states — keep explicit `Draft` / `Scheduled` ribbons in cards and post heroes; do not present either state as published
- Full-bleed separators (footer dividers, section dividers) must span the full viewport width, not the container width

## Visual QA

- Dev server runs at `http://localhost:8888` — always use this URL for Playwright visual checks
- During visual QA, explicitly check supporting-label readability, hero-to-first-section spacing, footer divider spacing, and last-section-to-footer separation when those surfaces are present

## Thumbnail Pipeline

Pagefind search results display a thumbnail per post. The pipeline:

1. Cover images are stored as `<slug>-cover.webp` colocated with the article
2. `<slug>-thumbnail.webp` (96×96, center-cropped WebP) is pre-generated via `pnpm thumbnails:generate`
3. `pnpm thumbnails:copy` mirrors thumbnails to `public/search-thumbnails/<slug>/<slug>-thumbnail.webp`
4. The layout references the stable path `/search-thumbnails/${postId}/${postId}-thumbnail.webp`
5. `public/search-thumbnails/` is gitignored — regenerated on every build

When adding a new post with a cover:

1. Save cover as `<slug>-cover.webp` in the post directory
2. Run `pnpm thumbnails:generate` to create `<slug>-thumbnail.webp`
3. Add `cover.thumbnail: './<slug>-thumbnail.webp'` to the post frontmatter

When renaming a post slug:

1. Rename `collections/posts/<old-slug>/` to the new slug
2. Rename every slug-derived asset in that folder (`<slug>-cover-source.*`, `<slug>-cover.webp`, `<slug>-thumbnail.webp`)
3. Update frontmatter, any generator scripts, and any public download paths that derive from the old slug

## Testing

- Test files live in `src/components/__tests__/`
- Shared HTML normalizer lives in `src/test/helpers.ts` — call `normalizeHtml()` before snapshotting to strip `data-astro-cid-*` hashes
- `pnpm test` / `pnpm test:watch` / `pnpm test:update`

## Visual Regression

Full-page screenshot tests using Playwright, covering 12 routes × 3 viewports.

- Config: `playwright.config.ts` — all Chromium, desktop (1280×900), tablet (Galaxy Tab S9), mobile (Pixel 7)
- Spec: `src/e2e/visual.spec.ts`
- Snapshots: `src/e2e/__snapshots__/visual.spec.ts-snapshots/{testFile}-snapshots/{platform}-{arch}/`, per `snapshotPathTemplate` in `playwright.config.ts`. Two folders are committed: `darwin-arm64` (generated natively on macOS, for local dev sanity checks) and `linux-x64` (the folder CI actually compares against, maintained only by the "Update Visual Baselines" workflow below)
- `pnpm test:visual` / `pnpm test:visual:update` — runs Playwright directly on the host (no Docker). Locally on macOS this produces/compares `darwin-arm64` baselines. These are for your own dev-loop only; they are never compared in CI

### Stability patterns

- Dynamic sections (recent posts, stats, tag cloud, guide meta) are masked with `dynamicSelectors`
- `.reactions` and `.comments` are hidden via injected CSS to prevent height variability
- `blog-post` clips height to `Math.floor(footerY / 16) * 16` to absorb sub-pixel font jitter, and uses `maxDiffPixelRatio: 0.05`
- All other routes use `maxDiffPixelRatio: 0.01`

### CI

The `visual-regression` / `visual-regression-preview` jobs in `.github/workflows/ci.yml` run on
`ubuntu-latest` inside the pinned Playwright Docker image, and only ever compare against the
committed `linux-x64` baselines — they never write snapshots back to the repo. If no `linux-x64`
baselines exist yet for a route/viewport, that check is skipped rather than failed.

To (re)generate the `linux-x64` baselines, manually dispatch the **Update Visual Baselines**
workflow (`.github/workflows/update-visual-baselines.yml`) from the Actions tab. It builds the
site and runs Playwright with `--update-snapshots` on the same `ubuntu-latest` + Docker image the
CI check uses, then opens a PR with the resulting PNGs for review — baselines are always generated
and compared on the same machine type, so there's no cross-platform/cross-arch drift to chase.
