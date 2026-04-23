# Project Instructions

## Overview

Personal tech blog and engineering consultancy site built with Astro 6, Sass/Bulma, and hosted on Netlify. Live at sourcier.uk.

## Tech Stack

- **Framework:** Astro 6 (static site generation with content collections)
- **Styling:** Sass + Bulma CSS framework
- **Content:** Markdown with frontmatter in `collections/posts/`
- **Serverless:** Netlify Functions (comments, subscriptions, scheduled builds)
- **Email:** Resend (notifications and newsletter)
- **Icons:** Font Awesome (SVG via `@fortawesome`)
- **Fonts:** Barlow + Barlow Condensed (Google Fonts)

## Development

```sh
pnpm dev              # Dev server with drafts (localhost:8888 via Netlify CLI)
pnpm dev:no-drafts    # Dev server without drafts
pnpm build            # Production build to dist/
```

Requires Node.js (see .nvmrc), pnpm, and Netlify CLI.

- **Dev server:** Always use the dev server at `http://localhost:8888` for UI-related tasks. If it is not running, ask the user to start it with `pnpm dev` before proceeding.

## Git Workflow

- Treat `web-sourcier.uk` and `collections/posts/` as separate repositories with separate status, staging, and commits
- The site repo uses the `preview` branch for code changes; do not commit site changes on `main`
- The content repo in `collections/posts/` stays on `main` unless the user asks for a different branch
- If a task spans both repos, inspect and commit them separately

## Project Structure

- `collections/posts/` — Blog posts (markdown + cover images)
- `src/pages/` — Astro page routes
- `src/components/` — Reusable Astro components
- `src/layouts/` — BaseLayout and MarkdownPostLayout
- `src/styles/global.scss` — Global styles and CSS variables
- `src/utils/` — Utilities (drafts, tags, icons)
- `src/plugins/` — Remark plugins (Mermaid)
- `netlify/functions/` — Serverless functions
- `scripts/` — One-off utility scripts

## Design System

- **Primary color:** `--color-pink: #e8006a` (HSL 330, 100%, 45%)
- **Headings:** Barlow Condensed, 800 weight, uppercase
- **Body:** Barlow, 400 weight
- **Dark mode:** Supported via `data-theme="dark"` on `<html>`
- **Breakpoints:** 640px (mobile/tablet), 768px (tablet/desktop)
- **Pill-style elements** (tags, share buttons, credits): 0.75rem / 0.25rem 0.6rem on desktop, 0.8rem / 0.4rem 0.75rem on mobile

## UI Conventions

- Audience-navigation surfaces should call these routes **guides**; prefer “guide” over “path” in headings, CTAs, and supporting copy unless the user explicitly asks otherwise
- In compact stat cards, put the small uppercase label above the main value and keep the value short enough to avoid awkward wrapping; longer role or employer detail belongs in sidebar/fact cards instead
- If a course, feature, or CTA is launching soon, surface that as a distinct status badge or label rather than burying it in paragraph copy
- Footer dividers that are meant to read as full-width separators should use full-bleed lines, not container-width borders
- Prefer positive, orientation-based section headings for navigation blocks; avoid “problem” framing when the section is helping readers choose where to start
- For any task that changes rendered UI, use Playwright to inspect the live interface before and after the change. Do not rely on code inspection alone for visual verification.
- Inspect multiple pages or breakpoints serially or in separate tabs. Do not issue parallel navigations or screenshots against the same Playwright page context.
- During visual QA, explicitly check supporting-label readability, hero-to-first-section spacing, footer divider spacing, and last-section-to-footer separation when relevant.
- Delete temporary screenshots created during Playwright review before handing off, unless the user explicitly asks to keep them.
- After finishing any Playwright MCP session, always close the browser by calling `mcp_playwright_browser_close` to avoid leaving it in a bad state.

## Coding Conventions

- Astro components use scoped `<style lang="scss">`
- BEM-style class naming (e.g. `.page-hero__title`, `.back-to-top--visible`)
- CSS variables for theming — never hardcode colours outside `:root`/`[data-theme]`
- Environment variables via `process.env` in Netlify functions, `import.meta.env` in Astro
- All secrets in Netlify dashboard, never in code — see `.env.example` for the list
- Draft posts controlled by `SHOW_DRAFTS` env var and `isPublished()` utility
- Use `isPublished()` for preview visibility, and use `isPubliclyPublished()` for anything labelled `Published` and any public-only counts or stats
- Posts with future dates auto-publish via daily scheduled build (07:45 UTC)

## Astro Conventions

- Embrace Islands Architecture: server-render by default, hydrate selectively
- Use `.astro` components for static content; framework components only when interactivity is needed
- Content collections defined in `src/content.config.ts` using Content Layer API with `glob()` loader
- Default to zero JavaScript — only add `client:load`/`client:idle`/`client:visible` where needed
- Use `<Image />` component for automatic image optimisation (WebP, srcset)
- Component script structure: frontmatter at top, template below
- Scoped styles in components; global styles in `src/styles/global.scss`

## Content

- Blog posts use frontmatter: title, pubDate, description, author, tags, coverImage, credits, draft, changelog
- Tags are normalised to slugs via `tagSlug()` in `src/utils/tags.ts`
- RSS feed at `/rss.xml` via `src/pages/rss.xml.js`
- Comment system uses Netlify Forms with email-based moderation (approve/delete via HMAC-signed links)
- Post slug is the folder name; when renaming a post, rename the folder and all slug-derived assets together (`<slug>-cover-source.*`, `<slug>-cover.webp`, `<slug>-thumbnail.webp`) and update any scripts or public paths that reference the old slug
- Companion posts for talks or meetups should mention the talk or event in the title or subtitle when that context is central to the article

### Post Frontmatter

```yaml
---
title: "Post Title"
subTitle: "Optional subtitle"
pubDate: 2026-03-30T00:00:00
description: "One-sentence description for meta tags and listings."
author: "Roger Rajaratnam"
cover:
  image: "./cover-image.jpg"
  alt: "Description — Photo credit if applicable"
tags: ["tag1", "tag2"]
draft: true
---
```

- Use `draft: true` while writing; set `draft: false` only when ready to publish
- `pubDate` uses ISO 8601. For same-day ordering, use time offsets (`T00:00:00`, `T00:05:00`). Lists sort descending
- Tags: lowercase, hyphenated (e.g. `web-performance`, `learning-in-public`). Prefer broad tags. Avoid single-use tags
- When renaming a tag, update every post that uses it in the same operation

### Markdown Rules

- No H1 headings in posts — generated from title
- Use `##` for H2, `###` for H3. Avoid H4+ where possible
- Fenced code blocks with language specified
- Line length limit: 400 characters
- Use `<span class="date-chip">April</span>` for inline date labels in series posts
- Show markdown source with double-fenced code blocks (more backticks wrapping fewer)
- Source/rendered tables for inline features (emoji, emphasis)

### Credits and History

- **Credits:** Keep up to date — add entries when new sources, tools, or attributions apply
- **History:** Only add entries after publication. Do not add pre-publish revision notes

```yaml
- date: 2026-03-30T00:00:00
  description: "Short description of what was added or changed"
```

### Series Articles

When updating an article in a series, also update the series kicker article (e.g. `how-this-blog-was-built`) to reflect changes — correct descriptions, adjust date chips, mark items as live

### Markdown Test Post

`collections/posts/markdown-test/index.md` is the living Markdown reference page. Supported features show source and rendered output. Unsupported features go in `## Not currently supported` with the plugin name
