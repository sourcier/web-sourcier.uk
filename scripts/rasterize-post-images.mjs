import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const DEFAULT_POST_IMAGES_DIR = "./public/post-images";

function collectSvgFiles(dir) {
  const svgFiles = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      svgFiles.push(...collectSvgFiles(entryPath));
      continue;
    }

    if (entry.isFile() && extname(entry.name).toLowerCase() === ".svg") {
      svgFiles.push(entryPath);
    }
  }

  return svgFiles;
}

export async function rasterizePostImages(
  postImagesDir = DEFAULT_POST_IMAGES_DIR,
) {
  if (!existsSync(postImagesDir)) {
    console.log(
      "No public/post-images directory found; skipping PNG fallback generation.",
    );
    return 0;
  }

  const svgFiles = collectSvgFiles(postImagesDir);

  let generated = 0;
  for (const svgPath of svgFiles) {
    await sharp(svgPath)
      .png()
      .toFile(join(dirname(svgPath), `${basename(svgPath, ".svg")}.png`));
    generated++;
  }

  return generated;
}

const isDirectExecution =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const generated = await rasterizePostImages();
  console.log(`Generated ${generated} PNG fallback(s) in public/post-images/`);
}
