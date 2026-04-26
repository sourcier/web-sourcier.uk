import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  outputDir: "./test-results",
  snapshotDir: "./src/e2e/__snapshots__",
  // Strip {platform} from snapshot names so macOS and Linux share the same baselines
  snapshotPathTemplate:
    "{snapshotDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}",
  retries: 0,
  workers: 1,
  reporter: process.env.CI
    ? [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : "list",
  use: {
    baseURL: "http://localhost:8888",
    // Disable animations and transitions so screenshots are deterministic
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
      use: { ...devices["iPad (gen 11)"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 15"] },
    },
  ],
});
