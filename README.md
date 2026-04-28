# sourcier.uk

[![Netlify Status](https://api.netlify.com/api/v1/badges/11a14542-cc35-4fdf-94e4-a61350e0652b/deploy-status)](https://app.netlify.com/projects/sourcieruk/deploys)

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

### Code Quality

```sh
pnpm lint                # Run ESLint across Astro, JS, and TS files
pnpm lint:fix            # Auto-fix lint issues where possible
pnpm format              # Format the project with Prettier
pnpm format:check        # Verify formatting without writing changes
```

`pnpm install` runs the `prepare` script to install Husky hooks. Pre-commit
then runs `lint-staged`, so staged code is linted and formatted before each
commit.

## Features

- **Blog** with draft support, future-dated post scheduling, and tag filtering
- **Comment system** using Netlify Forms with email-based moderation (approve/delete)
- **Newsletter** subscriptions via Resend with welcome email templates
- **Scheduled builds** (daily at 07:45 UTC) to auto-publish future-dated posts
- **Draft previews** via the `preview` branch deploy on Netlify — access at
  `https://preview--sourcier.netlify.app` (passcode-protected via edge function)
- **RSS feed** at `/rss.xml`

## Environment Variables

See [.env.example](.env.example) for the full list. Variables fall into two categories:

### Build-time (GitHub Actions secrets)

These are baked into the HTML by `astro build`. In CI they are passed via GitHub Actions secrets (GitHub → Settings → Secrets and variables → Actions). In local dev, set them in `.env`.

| Variable                        | Purpose                                                             |
| :------------------------------ | :------------------------------------------------------------------ |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — controls whether the tip button renders    |
| `PUBLIC_POSTHOG_KEY`            | PostHog project API key                                             |
| `PUBLIC_POSTHOG_HOST`           | PostHog ingest host, e.g. `https://eu.i.posthog.com`                |
| `GITHUB_PAT`                    | Fine-grained token to clone the private content repo at build time  |
| `SHOW_DRAFTS`                   | Set to `"true"` to include draft posts (CI sets this automatically) |

### Runtime (Netlify environment variables)

These are read by Netlify functions at request time and never embedded in the HTML. Set them in the Netlify dashboard (Site configuration → Environment variables).

| Variable               | Purpose                                     |
| :--------------------- | :------------------------------------------ |
| `NETLIFY_ACCESS_TOKEN` | Netlify API access                          |
| `APPROVAL_SECRET`      | HMAC signing for comment moderation links   |
| `RESEND_API_KEY`       | Email sending via Resend                    |
| `NOTIFY_EMAIL`         | Admin notification recipient                |
| `SITE_URL`             | Public site URL                             |
| `STRIPE_SECRET_KEY`    | Stripe secret key for the checkout function |
| `PREVIEW_PASSCODE`     | Passcode for the `preview` branch deploy    |

## License

[MIT](LICENSE)
