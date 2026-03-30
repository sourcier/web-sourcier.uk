---
description: 'Patterns and conventions for blog content, post structure, and common authoring tasks on sourcier.uk'
applyTo: '**/*.md, **/*.astro'
---

# Blog Content Patterns

## Post Frontmatter

Required fields for every post:

```yaml
---
title: 'Post Title'
subTitle: 'Optional subtitle'
pubDate: 2026-03-30T00:00:00
description: 'One-sentence description used in meta tags and listings.'
author: 'Roger Rajaratnam'
cover:
  image: './cover-image.jpg'
  alt: 'Description of image — Photo credit if applicable'
tags: ["tag1", "tag2"]
draft: true
---
```

- Use `draft: true` while writing; set `draft: false` only when ready to publish.
- `pubDate` uses ISO 8601 format. For posts on the same day that need a defined order, use time offsets: `T00:00:00`, `T00:05:00`, etc. Blog lists sort **descending** — a later timestamp appears first.

## Tags

- Use lowercase, hyphenated tags: `astro`, `web-performance`, `learning-in-public`.
- Prefer broad tags over narrow ones. Avoid single-use tags.
- When renaming a tag, update every post that uses it in the same operation.

## Date Chips

Use the `date-chip` span for inline date labels in prose, particularly in series listing posts:

```md
- Post title — <span class="date-chip">April</span>
- Another post — <span class="date-chip">Live</span>
```

The `date-chip` class renders in Barlow Condensed, uppercase, pink, with a border.

## Series Listing Posts

When a post lists a series of upcoming articles, format each item as:

```md
1. **Post title** — brief description. <span class="date-chip">Month</span>
```

Use `<span class="date-chip">Live</span>` for already-published entries.

## Showing Markdown Source

### Inline features — use a two-column table

For features where source and rendered output can sit side by side:

```md
| Source | Rendered |
| ------ | -------- |
| `:rocket:` | :rocket: |
| `~~text~~` | ~~text~~ |
```

### Block features — use a double-fenced code block

To show the raw Markdown source of a block element (code fence, mermaid, etc.), wrap it in a fence with more backticks:

````md
```mermaid
flowchart TD
    A --> B
```
````

### HTML elements — show source then rendered

```md
Source: `<span class="date-chip">1 April</span>`

Rendered: <span class="date-chip">1 April</span>
```

## Documenting Unsupported Features

When a Markdown feature is not enabled or a plugin is not installed, document it in a `## Not currently supported` section at the bottom of the relevant article. Each entry should name the plugin required and show what the syntax looks like (rendered as literal, since unsupported):

```md
## Not currently supported

> The following features are **not enabled** in this setup. They are documented here for reference and may be added in a future update.

### Feature name

Requires `plugin-name`. Not installed.

example-syntax (renders as literal)
```

Do **not** remove these sections — they serve as reference for future plugin evaluation.

## Series Articles

When updating an article that is part of a series, also update the series kicker article (e.g. `how-this-blog-was-built`) to reflect any changes — such as correcting the description, adjusting the date chip, or marking the item as live.

## Page History and Credits

These are separate components rendered below the post body. When updating post content, also update the page history entry to describe what changed:

```yaml
- date: 2026-03-30T00:00:00
  description: 'Short description of what was added or changed'
```

## Markdown Test Post

`collections/posts/markdown-test/index.md` is the site's living Markdown reference page (always `draft: true`). When updating it:

- For supported features: show source and rendered output; do not explain *how* they are enabled.
- For unsupported features: keep them in `## Not currently supported` with the plugin name.
- Use double-fenced code blocks to show raw Markdown source of block-level features.
- Use source/rendered tables for inline features (emoji, emphasis, etc.).
