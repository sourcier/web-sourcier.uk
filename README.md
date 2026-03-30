# sourcier.uk

Personal tech blog and engineering consultancy website built with [Astro](https://astro.build/) and hosted on [Netlify](https://www.netlify.com/).

Live at **[sourcier.uk](https://sourcier.uk)**

## Tech Stack

- **Framework:** Astro 6
- **Styling:** Sass + Bulma
- **Content:** Markdown with frontmatter (Astro Content Collections)
- **Hosting:** Netlify (static site + serverless functions)
- **Email:** Resend (comment notifications & newsletter)
- **Analytics:** PostHog
- **Extras:** Mermaid diagrams, Expressive Code syntax highlighting, RSS feed

## Project Structure

```
collections/posts/       # Blog posts (markdown + cover images)
src/
  components/            # Astro components
  layouts/               # Page layouts
  pages/                 # Routes (blog, tags, RSS, etc.)
  plugins/               # Remark plugins (Mermaid)
  styles/                # Global Sass styles
  utils/                 # Utilities (drafts, tags, icons)
netlify/functions/       # Serverless functions (comments, subscriptions, scheduled builds)
scripts/                 # One-off utility scripts (email templates, notifications)
```

## Getting Started

### Prerequisites

- Node.js (see [.nvmrc](.nvmrc) for version)
- [pnpm](https://pnpm.io/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm i -g netlify-cli`)

### Setup

```sh
pnpm install
cp .env.example .env     # Fill in your environment variables
```

### Development

```sh
pnpm dev                 # Start dev server with draft posts visible
pnpm dev:no-drafts       # Start dev server without drafts
```

### Build

```sh
pnpm build               # Build for production
pnpm preview             # Preview the production build locally
```

## Features

- **Blog** with draft support, future-dated post scheduling, and tag filtering
- **Comment system** using Netlify Forms with email-based moderation (approve/delete)
- **Newsletter** subscriptions via Resend with welcome email templates
- **Scheduled builds** (daily at 07:45 UTC) to auto-publish future-dated posts
- **Draft previews** via the `preview` branch deploy on Netlify
- **RSS feed** at `/rss.xml`

## Environment Variables

See [.env.example](.env.example) for the full list. Key variables:

| Variable | Purpose |
| :--- | :--- |
| `NETLIFY_ACCESS_TOKEN` | Netlify API access |
| `APPROVAL_SECRET` | HMAC signing for comment moderation links |
| `RESEND_API_KEY` | Email sending via Resend |
| `NOTIFY_EMAIL` | Admin notification recipient |
| `SITE_URL` | Public site URL |

All secrets should be configured in Netlify's environment variables dashboard for production.

## License

[MIT](LICENSE)
