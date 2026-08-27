import { test, expect } from "@playwright/test";

// Pages that exercise Bulma layout, components, forms, grid, and typography.
// Run `pnpm test:visual:update` to regenerate baselines after intentional changes.

// dynamicSelectors: elements that change when new content is published.
// Hidden via CSS display:none so their height is always zero — prevents page-height
// drift when new content causes a hidden section to grow taller between runs.
const routes = [
  {
    name: "home",
    path: "/",
    dynamicSelectors: ['section[aria-label="Recent Posts"]'],
  },
  {
    name: "blog-index",
    path: "/blog",
    dynamicSelectors: [
      ".blog-intro__stats",
      ".blog-grid-section",
      ".tag-cloud",
    ],
  },
  {
    name: "blog-post",
    path: "/blog/markdown-test",
    // Stable syntax-reference article — no series callout, no living content.
    // Clip to just before the footer so height is deterministic. Quantised to 256px
    // (rather than the default 16px) because this is the longest, most text-dense
    // page: font hinting/shaping can round very slightly differently between CPU
    // architectures (e.g. Apple Silicon locally vs the arm64 CI runner), and across
    // ~10,000px of body copy that accumulates into a real height difference.
    // maxDiffPixelRatio 0.08: cross-arch anti-aliasing differences run higher here
    // than the ~2% seen between same-arch launches; still low enough to catch a
    // genuine layout regression.
    clipToContent: true,
    clipQuantise: 256,
    maxDiffPixelRatio: 0.08,
    // TagsSidebar queries the live collection and shows per-tag post counts.
    dynamicSelectors: [".tags-sidebar"],
  },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "courses", path: "/courses" },
  {
    name: "guides-index",
    path: "/guides",
    dynamicSelectors: [".guide-card__meta"],
  },
  {
    name: "guide-detail",
    path: "/guides/engineering-career-growth",
    dynamicSelectors: [".guide-current", ".guide-planned"],
  },
  { name: "charity-support", path: "/charity-support" },
  {
    name: "tags",
    path: "/tags",
    dynamicSelectors: [".tag-summary__stats", ".cloud-section"],
  },
  {
    name: "tag-detail",
    path: "/tags/astro",
    dynamicSelectors: [
      ".topic-overview__title", // "X posts about Astro" — changes with every new post
      ".featured-post",
      ".topic-stats",
      ".related-tags", // tag co-occurrence list — changes when tag combinations change
      ".blog-grid-section",
    ],
  },
  { name: "404", path: "/does-not-exist" },
];

// Pages with external embeds or persistent network activity that prevent networkidle
const NO_NETWORK_IDLE = new Set(["contact"]);

for (const {
  name,
  path,
  dynamicSelectors,
  maxDiffPixelRatio,
  clipToContent,
  clipQuantise,
} of routes) {
  test(`visual: ${name}`, async ({ page }) => {
    await page.goto(path);

    if (NO_NETWORK_IDLE.has(name)) {
      await page.waitForLoadState("load");
    } else {
      await page.waitForLoadState("networkidle");
    }

    // Ensure all images are decoded so the page is visually stable
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images)
          .filter((img) => img.src && img.complete && img.naturalWidth > 0)
          .map((img) => img.decode().catch(() => {})),
      );
    });

    // Wait for webfonts to finish loading and reflowing before measuring layout.
    // toHaveScreenshot() waits for fonts internally before capturing pixels, but
    // clipToContent measures the footer position beforehand — without this wait,
    // a slow font load can reflow the page between the footer measurement and the
    // actual screenshot, producing a stale clip height and a false-positive diff.
    await page.evaluate(() => document.fonts.ready);

    // Remove async-loaded sections from layout to prevent height variability between runs
    await page.addStyleTag({
      content: `
        .reactions,
        .comments { display: none !important; }
      `,
    });

    let clip:
      | { x: number; y: number; width: number; height: number }
      | undefined;
    if (clipToContent) {
      const footerBox = await page.locator(".footer").boundingBox();
      if (footerBox) {
        // Quantise below the footer top so jitter between runs (sub-pixel by default,
        // or a wider tolerance for routes prone to cross-arch drift — see clipQuantise
        // per route) never crosses a boundary and the clip dimensions stay stable
        // without needing a baseline regeneration.
        const quantiseStep = clipQuantise ?? 16;
        clip = {
          x: 0,
          y: 0,
          width: footerBox.width,
          height: Math.floor(footerBox.y / quantiseStep) * quantiseStep,
        };
      }
    }

    if (dynamicSelectors?.length) {
      await page.addStyleTag({
        content: dynamicSelectors
          .map((sel: string) => `${sel} { display: none !important; }`)
          .join("\n"),
      });
    }

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: maxDiffPixelRatio ?? 0.01,
      timeout: 15000,
      ...(clip && { clip }),
    });
  });
}
