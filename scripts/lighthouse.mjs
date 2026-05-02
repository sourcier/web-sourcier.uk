import { spawnSync } from "child_process";
import { mkdirSync, readFileSync } from "fs";

const preset = process.argv[2];
if (preset !== "mobile" && preset !== "desktop") {
  console.error("Usage: node scripts/lighthouse.mjs mobile|desktop");
  process.exit(1);
}

const url = "http://localhost:9000";
const outputDir = "./reports/lighthouse";
const outputPath = `${outputDir}/${preset}`;
const chromeFlags = [
  "--headless",
  "--no-sandbox",
  "--no-enable-error-reporting",
].join(" ");

mkdirSync(outputDir, { recursive: true });

const args = [
  url,
  "--output",
  "html",
  "--output",
  "json",
  `--output-path=${outputPath}`,
  `--chrome-flags=${chromeFlags}`,
  ...(preset === "desktop" ? ["--preset=desktop"] : []),
];

const result = spawnSync("lighthouse", args, {
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) process.exit(result.status ?? 1);

const { categories } = JSON.parse(
  readFileSync(`${outputPath}.report.json`, "utf8"),
);

const lines = Object.entries(categories).map(([, { title, score }]) => {
  const label = title.padEnd(22);
  const value = score !== null ? `${Math.round(score * 100)}%` : "error";
  return `  ${label}${value}`;
});

console.log("\nLighthouse results:\n" + lines.join("\n"));
