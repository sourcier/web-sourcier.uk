import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { select } from "@inquirer/prompts";

import { rasterizePostImages } from "./rasterize-post-images.mjs";

const postsDir = "./collections/posts";

const syncJobs = {
  thumbnails: {
    destinationDir: "./public/search-thumbnails",
    includePatterns: ["*/", "*-thumbnail.webp"],
    skipMessage:
      "No collections/posts directory found; skipping thumbnail copy.",
    successMessage: "Copied thumbnails to public/search-thumbnails/",
  },
  "post-images": {
    destinationDir: "./public/post-images",
    includePatterns: ["*/", "*.svg"],
    skipMessage:
      "No collections/posts directory found; skipping post image copy.",
    successMessage: "Copied post images to public/post-images/",
  },
};

let mode = process.argv[2];
let syncJob = syncJobs[mode];

if (!syncJob) {
  mode = await select({
    message: "What would you like to sync?",
    choices: Object.keys(syncJobs).map((key) => ({ value: key })),
  }).catch(() => process.exit(0));
  syncJob = syncJobs[mode];
}

if (!existsSync(postsDir)) {
  console.log(syncJob.skipMessage);
  process.exit(0);
}

mkdirSync(syncJob.destinationDir, { recursive: true });

const rsyncArgs = [
  "-a",
  "--delete",
  "--delete-excluded",
  "--prune-empty-dirs",
  ...syncJob.includePatterns.map((pattern) => `--include=${pattern}`),
  "--exclude=*",
  `${postsDir}/`,
  `${syncJob.destinationDir}/`,
];

execFileSync("rsync", rsyncArgs, { stdio: "inherit" });
console.log(syncJob.successMessage);

if (mode === "post-images") {
  const generated = await rasterizePostImages(syncJob.destinationDir);
  console.log(`Generated ${generated} PNG fallback(s) in public/post-images/`);
}
