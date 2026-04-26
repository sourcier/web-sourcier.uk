import { test, expect } from "@playwright/test";

// Pages that exercise Bulma layout, components, forms, grid, and typography.
// Run `pnpm test:visual:update` to regenerate baselines after intentional changes.

const routes = [
  { name: "home", path: "/" },
  { name: "blog-index", path: "/blog" },
  { name: "blog-post", path: "/blog/how-this-blog-was-built" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "courses", path: "/courses" },
  { name: "guides-index", path: "/guides" },
  { name: "guide-detail", path: "/guides/engineering-career-growth" },
  { name: "charity-support", path: "/charity-support" },
  { name: "tags", path: "/tags" },
  { name: "tag-detail", path: "/tags/astro" },
  { name: "404", path: "/does-not-exist" },
];

for (const { name, path } of routes) {
  test(`visual: ${name}`, async ({ page }) => {
    await page.goto(path);

    // Dismiss any cookie banners / wait for fonts / animations to settle
    await page.waitForLoadState("networkidle");

    // Hide dynamic content that changes between runs (e.g. reaction counts)
    await page.addStyleTag({
      content: `
        .reactions__count,
        .comments__count { visibility: hidden !important; }
      `,
    });

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
}
