---
description: "Markdown guidelines and content creation standards for blog posts"
applyTo: "**/*.md"
---

# Markdown Content Rules

## Structure

- **No H1 headings** — the page title is generated from `title` in frontmatter.
- Use `##` for H2 and `###` for H3. Avoid H4+ where possible.
- Use blank lines to separate sections.

## Formatting

- Fenced code blocks with language specified: ` ```typescript `, ` ```sh `, etc.
- **Use only Shiki-bundled languages** for code fences — `gitignore` is not bundled and will fall back to `txt` with a build warning. Use `text` instead.
- **Shell blocks with a `title` attribute** trigger the file-icons plugin icon lookup, which has no `sh` icon. Add `no-icon` to suppress it: ` ```sh title=".husky/pre-commit" no-icon `
- Line length limit: 400 characters.
- Use `-` for unordered lists, `1.` for ordered lists. Indent nested lists with two spaces.
- `[link text](URL)` — descriptive link text, always valid URLs.
- `![alt text](./image.webp)` — meaningful alt text on all images.
- **No em dashes in prose.** Use a colon, comma, or plain sentence break instead. Em dashes belong only inside code block string literals where they represent actual site content.
- **No parentheses for listing items.** Use a comma-separated list, a colon followed by a list, or a proper unordered list instead. Parentheses are acceptable for brief clarifications (e.g. units, abbreviations) but not for enumerating multiple items.

## Front Matter Checklist

- [ ] `title` — page title (no H1 in body)
- [ ] `subTitle` — subtitle shown below the title
- [ ] `pubDate` — ISO 8601 date/time (e.g. `2026-04-01T00:00:00`)
- [ ] `description` — one sentence for meta tags and post listings
- [ ] `author` — `Roger Rajaratnam`
- [ ] `tags` — lowercase, hyphenated array (e.g. `["astro", "web-performance"]`)
- [ ] `draft` — `true` until ready to publish
- [ ] `cover` — optional; `image: './slug-cover.webp'` + meaningful `alt` + `thumbnail: './slug-thumbnail.webp'` if generated
- [ ] `credits` — add when using external images, tools, or sources
- [ ] `history` — add entries only **after** publication; use `datetime` + `note`

## Tags

- Lowercase, hyphenated: `astro`, `web-performance`, `learning-in-public`.
- Prefer broad tags. Avoid single-use tags.
- When renaming a tag, update every post that uses it in the same operation.

## Date Chips

Use the `date-chip` span for inline date labels in prose, particularly in series listing posts:

```md
- Post title — <span class="date-chip">April</span>
- Another post — <span class="date-chip">Live</span>
```

## Series Listing Posts

```md
1. **Post title** — brief description. <span class="date-chip">Month</span>
```

Use `<span class="date-chip">Live</span>` for already-published entries.

## Showing Markdown Source

### Inline features — two-column table

```md
| Source     | Rendered |
| ---------- | -------- |
| `:rocket:` | :rocket: |
| `~~text~~` | ~~text~~ |
```

### Block features — double-fenced code block

Wrap in a fence with more backticks than the inner fence:

`````md
````md
```mermaid
flowchart TD
    A --> B
```
````
`````

### HTML elements — source then rendered

```md
Source: `<span class="date-chip">1 April</span>`

Rendered: <span class="date-chip">1 April</span>
```

## Unsupported Features

Document unsupported Markdown features in a `## Not currently supported` section at the bottom of the relevant article. Name the plugin required; show the syntax as literal text (since unsupported).

```md
## Not currently supported

> The following features are **not enabled** in this setup.

### Feature name

Requires `plugin-name`. Not installed.
```
