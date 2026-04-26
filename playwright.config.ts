import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  outputDir: "./test-results",
  snapshotDir: "./src/e2e/__snapshots__",
  // Include {platform} so macOS (darwin) and Linux each compare against their own baselines
  snapshotPathTemplate:
    "{snapshotDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}",
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [
        ["dot"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["json", { outputFile: "test-results.json" }],
      ]
    : "list",
  use: {
    baseURL: "http://localhost:8888",
    contextOptions: { reducedMotion: "reduce" },
    launchOptions: {
      args: ["--force-prefers-reduced-motion"],
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
      use: { ...devices["Galaxy Tab S9"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
