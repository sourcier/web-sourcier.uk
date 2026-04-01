---
description: 'Astro development standards and best practices for sourcier.uk'
applyTo: '**/*.astro, **/*.ts, **/*.js, **/*.md, **/*.mdx'
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
pnpm thumbs:generate  # Generate thumb.webp for any post with a cover but no thumb
pnpm thumbs:copy      # Copy thumb.webp files to public/search-thumbs/<slug>/
```

`pnpm dev` and `pnpm search:index` automatically run `thumbs:copy` first.

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

## Content Collections

Defined in `src/content.config.ts` using the Content Layer API:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './collections/posts' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subTitle: z.string(),
    pubDate: z.coerce.date(),
    cover: z.object({ image: image(), alt: z.string() }).optional(),
    thumb: z.string().optional(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
    // ... history, credits
  })
});
```

- Post ID (slug) is derived from the folder name, e.g. `collections/posts/my-post/index.md` → `my-post`
- `thumb` is a plain string (not an Astro image) — bypasses filename hashing so the path stays stable

## Styling Conventions

- BEM-style class naming: `.page-hero__title`, `.back-to-top--visible`
- CSS variables for theming — never hardcode colours outside `:root` / `[data-theme]`
- Dark mode via `data-theme="dark"` on `<html>`
- Breakpoints: 640px (mobile/tablet), 768px (tablet/desktop)
- Primary colour: `--color-pink: #e8006a`

## Thumbnail Pipeline

Pagefind search results display a thumbnail per post. The pipeline:

1. Cover images are stored as `<slug>-cover.webp` colocated with the article
2. `thumb.webp` (96×96, center-cropped WebP) is pre-generated via `pnpm thumbs:generate`
3. `scripts/copy-thumbs.mjs` copies thumbs to `public/search-thumbs/<slug>/thumb.webp`
4. The layout references the stable path `/search-thumbs/${postId}/thumb.webp`
5. `public/search-thumbs/` is gitignored — regenerated on every build

When adding a new post with a cover:
1. Save cover as `<slug>-cover.webp` in the post directory
2. Run `pnpm thumbs:generate` to create `thumb.webp`
3. Add `thumb: './thumb.webp'` to the post frontmatter

## Pagefind Search

- `data-pagefind-body` on the `<article>` element marks indexable content
- `data-pagefind-meta="title"` on a `.visually-hidden` `<span>` sets the result title
- `data-pagefind-meta="image[src]"` on a `.visually-hidden` `<img>` sets the result thumbnail
- Use `.visually-hidden` (CSS clip pattern) — **not** `display:none`, which Pagefind skips
- Pagefind JS loaded at runtime via `import('/pagefind/pagefind.js')` in an `is:inline` script
- `public/pagefind/` is gitignored — rebuilt by `pnpm search:index`

## Environment Variables

- `import.meta.env` in Astro components
- `process.env` in Netlify functions
- All secrets in Netlify dashboard, never in code — see `.env.example`
- Draft posts: controlled by `SHOW_DRAFTS` env var and `isPublished()` utility

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
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({ title: z.string(), pubDate: z.date() })
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
