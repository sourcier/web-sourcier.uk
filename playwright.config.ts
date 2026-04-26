import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  outputDir: "./test-results",
  snapshotDir: "./src/e2e/__snapshots__",
  // Strip {platform} from snapshot names so macOS and Linux share the same baselines
  snapshotPathTemplate:
    "{snapshotDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}",
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : "list",
  use: {
    baseURL: "http://localhost:8888",
    launchOptions: {
      args: [
        "--force-prefers-reduced-motion",
        // Normalise text rendering so Chromium produces identical pixels on macOS and Linux
        "--disable-lcd-text",
        "--disable-font-subpixel-positioning",
      ],
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "tablet",
      // Galaxy Tab S9 — Chromium with touch emulation, avoids WebKit cross-OS rendering differences
      use: { ...devices["Galaxy Tab S9"] },
    },
    {
      name: "mobile",
      // Pixel 7 is a Chromium-based device — consistent rendering on macOS and Linux
      use: { ...devices["Pixel 7"] },
    },
  ],
});
