---
description: "Astro development standards and best practices for sourcier.uk"
applyTo: "**/*.astro, **/*.ts, **/*.js, **/*.md, **/*.mdx"
---

# Astro Development Instructions

## Project Context

- **Astro 6** with Islands Architecture and Content Layer API
- **Styling:** Sass + Bulma CSS framework — `<style lang="scss">` in components, global styles in `src/styles/global.scss`
- **Content:** Markdown in `collections/posts/` (separate git submodule), loaded via `glob()` in `src/content.config.ts`
- **Hosting:** Netlify (serverless functions, edge functions, scheduled builds)
- **Search:** Pagefind static site search, indexed after build
- **Static site generation** (SSG) — no SSR

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

## Architecture

- Islands Architecture: server-render by default, hydrate selectively
- Default to zero JavaScript — only add `client:load` / `client:idle` / `client:visible` where needed
- Follow Multi-Page App (MPA) approach
- Component script structure: frontmatter at top, template below

## TypeScript

- `tsconfig.json` extends `astro/tsconfigs/base`
- Types auto-generated in `.astro/types.d.ts` — run `astro sync` to refresh
- Define component props with TypeScript interfaces

## Component Design

- Use `.astro` components for static, server-rendered content
- Keep components focused and composable; use PascalCase names
- Scoped `<style lang="scss">` in each component for component-specific styles
- Global / utility styles go in `src/styles/global.scss` (e.g. `.visually-hidden`, search modal styles)
- **Scoped Astro styles do not apply to elements injected via `innerHTML`** — put those styles in `global.scss`
- **Conditional wrapper elements:** When a component needs a prop to toggle a wrapping element (e.g. `noContainer`), write **two full JSX branches** — one with the wrapper and one without. Do not try to conditionally render only the opening or closing tag (e.g. `{noContainer ? null : </div>}`) — this is invalid Astro/JSX syntax and will produce a broken template.

## Content Collections

Defined in `src/content.config.ts` using the Content Layer API:

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "!README.md"],
    base: "./collections/posts",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subTitle: z.string(),
      pubDate: z.coerce.date(),
      cover: z
        .object({
          image: image(),
          alt: z.string(),
          thumbnail: z.string().optional(),
        })
        .optional(),
      tags: z.array(z.string()),
      draft: z.boolean().default(false),
      // ... history, credits
    }),
});
```

- Post ID (slug) is derived from the folder name, e.g. `collections/posts/my-post/index.md` → `my-post`
- `cover.thumbnail` is a plain string (not an Astro image) — bypasses filename hashing so the path stays stable

## Styling Conventions

- BEM-style class naming: `.page-hero__title`, `.back-to-top--visible`
- CSS variables for theming — never hardcode colours outside `:root` / `[data-theme]`
- Dark mode via `data-theme="dark"` on `<html>`
- Breakpoints: 640px (mobile/tablet), 768px (tablet/desktop)
- Primary colour: `--color-pink: #e8006a`

## UI Refinement Conventions

- Audience-navigation surfaces on Sourcier should call these curated routes **guides**; prefer “guide” over “path” in headings, buttons, and supporting copy unless the user explicitly asks otherwise
- In compact stat cards, place the small uppercase label above the value and keep the value short enough to avoid awkward wrapping; longer role or employer details belong in sidebar-style fact cards instead
- When something is launching soon, promote that status into a distinct badge or label instead of relying on paragraph copy alone
- Draft and scheduled posts are distinct preview states. When they are visible in dev or preview, keep explicit status labels in cards and post heroes, and do not present either state as published.
- Blog cards should use the same faded preview treatment for draft and scheduled posts, with ribbons that read `Draft` or `Scheduled` to match the underlying publication state.
- If a footer divider or similar separator is meant to read as page-wide, implement it as a full-bleed line instead of a container-width border
- For guides and similar navigation sections, prefer positive orientation headings over “problem” wording

## UI Verification

- For any change that affects rendered UI, use Playwright to inspect the live interface before and after the change. Do not rely on code inspection alone for visual verification.
- Inspect multiple breakpoints or pages serially, or in separate tabs. Do not queue parallel navigations or screenshots against the same Playwright page context.
- During visual QA, explicitly check supporting-label readability, hero-to-first-section spacing, footer divider spacing, and last-section-to-footer separation when those surfaces are present.
- Delete temporary screenshots created during Playwright review before handing off, unless the user explicitly asks to keep them.

## Thumbnail Pipeline

Pagefind search results display a thumbnail per post. The pipeline:

1. Cover images are stored as `<slug>-cover.webp` colocated with the article
2. `<slug>-thumbnail.webp` (96×96, center-cropped WebP) is pre-generated via `pnpm thumbnails:generate`

- `pnpm thumbnails:copy` mirrors thumbnails to `public/search-thumbnails/<slug>/<slug>-thumbnail.webp`

## Testing

The project uses Vitest with Astro's experimental Container API to snapshot-test reusable `.astro` components.

### Setup

- `vitest.config.ts` uses `getViteConfig` from `astro/config` so `.astro` files are processed correctly
- Add `/// <reference types="vitest/config" />` at the top of `vitest.config.ts` — this is the directive that augments Vite's `UserConfig` type with the `test` property (`/// <reference types="vitest" />` does **not** work for this)
- Test files live in `src/components/__tests__/` and follow the pattern `<ComponentName>.test.ts`
- A shared normalizer lives in `src/test/helpers.ts` — call `normalizeHtml()` on all rendered output before snapshotting, so that Astro's scoped-style `data-astro-cid-*` hashes don't cause spurious snapshot failures

### Container API usage

```ts
import { experimental_AstroContainer as AstroContainer } from "astro/container";

// Correct type annotation — constructor is private so InstanceType<> fails
let container: Awaited<ReturnType<typeof AstroContainer.create>>;

beforeAll(async () => {
  container = await AstroContainer.create();
});

it("renders snapshot", async () => {
  const html = await container.renderToString(MyComponent, { props: { ... } });
  expect(normalizeHtml(html)).toMatchSnapshot();
});
```

- Do NOT use `InstanceType<typeof AstroContainer>` — the constructor is private and TypeScript will error

### Scripts

- `pnpm test` — run all tests once
- `pnpm test:watch` — watch mode
- `pnpm test:update` — regenerate snapshots after intentional component changes

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
4. Rerun `pnpm thumbnails:copy` or `pnpm build` so public search thumbnails catch up with the rename

## Post Images (SVG)

Astro's image optimisation pipeline (Sharp) cannot process SVG files, so SVGs referenced in markdown body content must be served from `public/` as static files.

- `pnpm post-images:copy` mirrors `.svg` files from `collections/posts/<slug>/` → `public/post-images/<slug>/`
- `scripts/rasterize-post-images.mjs` generates sibling `.png` fallbacks for cross-posting workflows
- `public/post-images/` is gitignored — regenerated on every build and dev start
- In markdown, reference SVGs with absolute paths: `/post-images/<slug>/<filename>.svg`
- The rehype plugin `src/plugins/rehype-zoomable-images.js` adds `class="zoomable"` to every markdown `<img>` at build time, enabling the lightbox expand button

## Expandable Images and Mermaid Lightbox

All markdown images automatically get an expand button, and all Mermaid diagrams get one too. They share the same lightbox implementation in `MarkdownPostLayout.astro`.

**How it works:**

- `rehype-zoomable-images.js` (registered in `astro.config.mjs`) adds `class="zoomable"` to every `<img>` in markdown at build time, wrapped in a `p.zoomable-image` container
- At runtime, `MarkdownPostLayout.astro` queries each `.zoomable` image and appends a `.media-expand-btn` button
- The same lightbox DOM structure is used for both images and Mermaid SVGs:
  - `.media-lightbox` — fixed overlay
  - `.media-lightbox__inner` — the card (non-scrolling, holds the fade `::after`)
  - `.media-lightbox__scroll` — the scrolling container
  - `.media-lightbox__content` — the content (cloned SVG or `<img>`)
- Scroll affordance: a `::after` fade + "scroll for more ↓" label on `inner`, hidden via `is-scrolled-end` class when fully scrolled
- `mermaid.run()` receives only actual Mermaid containers as `nodes` (from the `definitions` Map), not SVG image wrappers, to prevent the renderer wiping non-Mermaid SVGs

## Pagefind Search

- `data-pagefind-body` on the `<article>` element marks indexable content
- `data-pagefind-meta="title"` on a `.visually-hidden` `<span>` sets the result title
- `data-pagefind-meta="image[src]"` on a `.visually-hidden` `<img>` sets the result thumbnail
- Use `.visually-hidden` (CSS clip pattern) — **not** `display:none`, which Pagefind skips
- Pagefind JS loaded at runtime via `import('/pagefind/pagefind.js')` in an `is:inline` script
- `public/pagefind/` is gitignored — rebuilt by `pnpm search:index`

## Git Workflow

This applies to the **site repo** (`web-sourcier.uk`) only — not the content repo.

- The site repo (`web-sourcier.uk`) uses the `preview` branch for code changes
- The nested content repo (`collections/posts/`) stays on `main` unless the user explicitly asks for a different branch
- When work spans both repos, inspect status in both repositories and commit them separately
- Only merge site repo changes into `main` once the user explicitly gives the go-ahead
- Never push directly to site `main`

## Environment Variables

- `import.meta.env` in Astro components
- `process.env` in Netlify functions
- All secrets in Netlify dashboard, never in code — see `.env.example`
- Draft posts: controlled by `SHOW_DRAFTS` env var and `isPublished()` utility
- Use `isPublished()` for visibility in dev and preview, where `SHOW_DRAFTS=true` may intentionally expose draft and scheduled posts.
- Use `isPubliclyPublished()` for anything labelled `Published` and for any public-only counts, totals, or stats.
- `SHOW_DRAFTS=true` is for visibility only. It may expose draft and scheduled posts in dev or preview, but it must not collapse their status into a published presentation.

## Performance

- Use `<Image />` component for automatic image optimisation (WebP, srcset)
- Minimise client-side JavaScript
- Posts with future `pubDate` auto-publish via daily scheduled build (07:45 UTC)

### Client-Side Interactivity

- Use framework components (React, Vue, Svelte) for interactive elements
- Choose the right hydration strategy based on user interaction patterns
- Implement state management within framework boundaries
- Handle client-side routing carefully to maintain MPA benefits
- Use Web Components for framework-agnostic interactivity
- Share state between islands using stores or custom events

### API Routes and SSR

- Create API routes in `src/pages/api/` for dynamic functionality
- Use proper HTTP methods and status codes
- Implement request validation and error handling
- Enable SSR mode for dynamic content requirements
- Use middleware for authentication and request processing
- Handle environment variables securely

### SEO and Meta Management

- Use Astro's built-in SEO components and meta tag management
- Implement proper Open Graph and Twitter Card metadata
- Generate sitemaps automatically for better search indexing
- Use semantic HTML structure for better accessibility and SEO
- Implement structured data (JSON-LD) for rich snippets
- Optimize page titles and descriptions for search engines

### Image Optimization

- Use Astro's `<Image />` component for automatic optimization
- Implement responsive images with proper srcset generation
- Use WebP and AVIF formats for modern browsers
- Lazy load images below the fold
- Provide proper alt text for accessibility
- Optimize images at build time for better performance

### Data Fetching

- Fetch data at build time in component frontmatter
- Use dynamic imports for conditional data loading
- Implement proper error handling for external API calls
- Cache expensive operations during build process
- Use Astro's built-in fetch with automatic TypeScript inference
- Handle loading states and fallbacks appropriately

### Build & Deployment

- Optimize static assets with Astro's built-in optimizations
- Configure deployment for static (SSG) or hybrid (SSR) rendering
- Use environment variables for configuration management
- Enable compression and caching for production builds

## Key Astro v5.0 Updates

### Breaking Changes

- **ClientRouter**: Use `<ClientRouter />` instead of `<ViewTransitions />`
- **TypeScript**: Auto-generated types in `.astro/types.d.ts` (run `astro sync`)
- **Content Layer API**: New `glob()` and `file()` loaders for enhanced performance

### Migration Example

```typescript
// Modern Content Layer API
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({ title: z.string(), pubDate: z.date() }),
});
```

## Implementation Guidelines

### Development Workflow

1. Use `npm create astro@latest` with TypeScript template
2. Configure Content Layer API with appropriate loaders
3. Set up TypeScript with `astro sync` for type generation
4. Create layout components with Islands Architecture
5. Implement content pages with SEO and performance optimization

### Astro-Specific Best Practices

- **Islands Architecture**: Server-first with selective hydration using client directives
- **Content Layer API**: Use `glob()` and `file()` loaders for scalable content management
- **Zero JavaScript**: Default to static rendering, add interactivity only when needed
- **View Transitions**: Enable SPA-like navigation with `<ClientRouter />`
- **Type Safety**: Leverage auto-generated types from Content Collections
- **Performance**: Optimize with built-in image optimization and minimal client bundles
