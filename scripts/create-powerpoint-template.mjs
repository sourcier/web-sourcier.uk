import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "assets", "templates");
const outputFile = path.join(outputDir, "sourcier-blog-template.pptx");

const COLORS = {
  pink: "E8006A",
  green: "2A7D5B",
  greenDeep: "1B5A40",
  ink: "0F0F0F",
  paper: "FFFFFF",
  elevated: "FFFAF4",
  warmTop: "F6ECE1",
  warmBottom: "E5D8C9",
  muted: "6B6B6B",
  mutedLight: "D8D8D8",
  darkBg: "0A0A0A",
  darkBgBottom: "101410",
  border: "D7D7D7",
  borderWarm: "D8C5AE",
};

const FONT = {
  heading: "Barlow Condensed",
  body: "Barlow",
};

function addAtmosphere(slide) {
  slide.background = { color: COLORS.warmTop };

  slide.addShape("roundRect", {
    x: -2.1,
    y: -1.2,
    w: 5.9,
    h: 4.9,
    rectRadius: 0.3,
    fill: { color: COLORS.pink, transparency: 92 },
    line: { color: COLORS.pink, transparency: 100 },
  });

  slide.addShape("roundRect", {
    x: 9.2,
    y: -1.5,
    w: 6.2,
    h: 5.6,
    rectRadius: 0.3,
    fill: { color: COLORS.green, transparency: 90 },
    line: { color: COLORS.green, transparency: 100 },
  });

  slide.addShape("roundRect", {
    x: 7.1,
    y: 5.5,
    w: 8.1,
    h: 3.4,
    rectRadius: 0.3,
    fill: { color: COLORS.warmBottom, transparency: 24 },
    line: { color: COLORS.warmBottom, transparency: 100 },
  });
}

function addHeader(slide, title, subtitle = "") {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.72,
    fill: { color: COLORS.darkBgBottom },
    line: { color: COLORS.darkBgBottom },
  });

  slide.addShape("line", {
    x: 0,
    y: 0.72,
    w: 13.333,
    h: 0,
    line: { color: COLORS.pink, pt: 2.25 },
  });

  slide.addShape("line", {
    x: 0,
    y: 0.68,
    w: 13.333,
    h: 0,
    line: { color: COLORS.green, pt: 0.75, transparency: 24 },
  });

  slide.addText("SOURCIER", {
    x: 0.5,
    y: 0.17,
    w: 2.8,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: "FFFFFF",
    fontSize: 18,
    charSpace: 1.25,
  });

  if (title) {
    slide.addText(title.toUpperCase(), {
      x: 0.5,
      y: 1.0,
      w: 8.6,
      h: 0.75,
      fontFace: FONT.heading,
      bold: true,
      color: COLORS.ink,
      fontSize: 34,
      fit: "shrink",
      valign: "mid",
    });
  }

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 1.75,
      w: 9.8,
      h: 0.45,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 18,
      valign: "top",
    });
  }
}

function addFooter(slide, left = "sourcier.uk") {
  slide.addShape("line", {
    x: 0.5,
    y: 7.05,
    w: 12.333,
    h: 0,
    line: { color: COLORS.border, pt: 1 },
  });

  slide.addText(left, {
    x: 0.5,
    y: 7.08,
    w: 4.0,
    h: 0.2,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 10,
  });

  slide.addText("[slide number]", {
    x: 11.75,
    y: 7.08,
    w: 1.1,
    h: 0.2,
    align: "right",
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 10,
  });
}

function addTitleSlide(pptx) {
  const slide = pptx.addSlide();

  slide.background = { color: COLORS.darkBg };

  slide.addShape("roundRect", {
    x: 9.6,
    y: -1.45,
    w: 5.5,
    h: 5.5,
    rectRadius: 0.3,
    fill: { color: COLORS.pink, transparency: 74 },
    line: { color: COLORS.pink, transparency: 100 },
  });

  slide.addShape("roundRect", {
    x: 8.2,
    y: -1.2,
    w: 4.9,
    h: 4.9,
    rectRadius: 0.3,
    fill: { color: COLORS.green, transparency: 82 },
    line: { color: COLORS.green, transparency: 100 },
  });

  slide.addShape("roundRect", {
    x: -2.2,
    y: 4.8,
    w: 6.2,
    h: 4,
    rectRadius: 0.3,
    fill: { color: "FFFFFF", transparency: 92 },
    line: { color: "FFFFFF", transparency: 100 },
  });

  slide.addText("SOURCIER", {
    x: 0.8,
    y: 0.8,
    w: 3.2,
    h: 0.4,
    fontFace: FONT.heading,
    bold: true,
    color: "FFFFFF",
    fontSize: 26,
    charSpace: 1.4,
  });

  slide.addShape("line", {
    x: 0.8,
    y: 1.33,
    w: 2.6,
    h: 0,
    line: { color: COLORS.pink, pt: 2.5 },
  });

  slide.addText("PRESENTATION TITLE", {
    x: 0.8,
    y: 2.1,
    w: 10.7,
    h: 1.1,
    fontFace: FONT.heading,
    bold: true,
    color: "FFFFFF",
    fontSize: 54,
    valign: "mid",
    fit: "shrink",
  });

  slide.addText("Subtitle or short framing statement", {
    x: 0.8,
    y: 3.35,
    w: 8.4,
    h: 0.4,
    fontFace: FONT.body,
    color: "E5E5E5",
    fontSize: 20,
  });

  slide.addText("Roger Rajaratnam", {
    x: 0.8,
    y: 6.55,
    w: 4.0,
    h: 0.3,
    fontFace: FONT.body,
    color: "E5E5E5",
    fontSize: 14,
  });

  slide.addText("sourcier.uk", {
    x: 0.8,
    y: 6.88,
    w: 4.0,
    h: 0.25,
    fontFace: FONT.body,
    color: COLORS.pink,
    fontSize: 12,
  });
}

function addSectionSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);

  addHeader(slide, "Section Heading", "Use this slide to split major themes.");

  slide.addShape("roundRect", {
    x: 0.5,
    y: 2.55,
    w: 12.333,
    h: 3.55,
    rectRadius: 0.08,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("rect", {
    x: 0.5,
    y: 2.55,
    w: 0.16,
    h: 3.55,
    fill: { color: COLORS.pink },
    line: { color: COLORS.pink, pt: 0 },
  });

  slide.addText("SECTION TITLE", {
    x: 1.05,
    y: 3.35,
    w: 9.8,
    h: 0.72,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 42,
  });

  slide.addText("Optional context line for this part of the deck", {
    x: 1.05,
    y: 4.2,
    w: 10.5,
    h: 0.4,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 18,
  });

  addFooter(slide);
}

function addContentSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);

  addHeader(
    slide,
    "Content Layout",
    "Two-column slide with clear visual hierarchy.",
  );

  slide.addShape("rect", {
    x: 0.5,
    y: 2.35,
    w: 5.95,
    h: 4.35,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("rect", {
    x: 6.88,
    y: 2.35,
    w: 5.95,
    h: 4.35,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("Left column heading", {
    x: 0.86,
    y: 2.72,
    w: 5.2,
    h: 0.38,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 24,
  });

  slide.addText("- Point one\n- Point two\n- Point three", {
    x: 0.86,
    y: 3.25,
    w: 5.2,
    h: 3.1,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 17,
    breakLine: true,
    valign: "top",
  });

  slide.addText("Right column heading", {
    x: 7.24,
    y: 2.72,
    w: 5.2,
    h: 0.38,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 24,
  });

  slide.addShape("roundRect", {
    x: 7.24,
    y: 3.25,
    w: 5.2,
    h: 3.1,
    rectRadius: 0.08,
    fill: { color: COLORS.warmTop },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("Drop chart, screenshot, or code image here", {
    x: 7.5,
    y: 4.55,
    w: 4.7,
    h: 0.35,
    align: "center",
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 14,
  });

  addFooter(slide);
}

function addQuoteSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);

  addHeader(
    slide,
    "Quote Layout",
    "Ideal for key takeaways and narrative pivots.",
  );

  slide.addShape("roundRect", {
    x: 1.25,
    y: 2.45,
    w: 10.85,
    h: 3.35,
    rectRadius: 0.1,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.pink, pt: 1.5 },
  });

  slide.addShape("rect", {
    x: 1.25,
    y: 2.45,
    w: 0.14,
    h: 3.35,
    fill: { color: COLORS.green },
    line: { color: COLORS.green, pt: 0 },
  });

  slide.addText('"', {
    x: 1.7,
    y: 2.7,
    w: 0.9,
    h: 0.7,
    fontFace: FONT.heading,
    color: COLORS.pink,
    fontSize: 72,
  });

  slide.addText(
    "Replace with a strong insight, user quote, or key lesson from the project.",
    {
      x: 2.4,
      y: 3.3,
      w: 8.9,
      h: 1.4,
      fontFace: FONT.body,
      color: COLORS.ink,
      fontSize: 27,
      italic: true,
      fit: "shrink",
      align: "center",
      valign: "mid",
    },
  );

  slide.addText("Attribution / Source", {
    x: 2.4,
    y: 5.12,
    w: 8.9,
    h: 0.3,
    align: "center",
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 14,
  });

  addFooter(slide);
}

function addImageSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);

  addHeader(
    slide,
    "Image + Caption",
    "Use for screenshots, architecture diagrams, or mockups.",
  );

  slide.addShape("rect", {
    x: 0.8,
    y: 2.2,
    w: 11.75,
    h: 4.3,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("line", {
    x: 0.8,
    y: 2.2,
    w: 11.75,
    h: 4.3,
    line: { color: COLORS.border, pt: 1 },
  });

  slide.addShape("line", {
    x: 12.55,
    y: 2.2,
    w: -11.75,
    h: 4.3,
    line: { color: COLORS.border, pt: 1 },
  });

  slide.addText("Replace with image", {
    x: 5.35,
    y: 4.23,
    w: 2.65,
    h: 0.3,
    align: "center",
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 14,
  });

  slide.addText("Caption or callout text can go here.", {
    x: 0.8,
    y: 6.65,
    w: 11.75,
    h: 0.35,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 15,
  });

  addFooter(slide);
}

function addClosingSlide(pptx) {
  const slide = pptx.addSlide();

  slide.background = { color: COLORS.darkBgBottom };

  slide.addShape("roundRect", {
    x: 8.7,
    y: -1.8,
    w: 6.4,
    h: 6.4,
    rectRadius: 0.3,
    fill: { color: COLORS.pink, transparency: 70 },
    line: { color: COLORS.pink, transparency: 100 },
  });

  slide.addShape("roundRect", {
    x: 10.3,
    y: -0.8,
    w: 5,
    h: 5,
    rectRadius: 0.3,
    fill: { color: COLORS.green, transparency: 82 },
    line: { color: COLORS.green, transparency: 100 },
  });

  slide.addText("THANK YOU", {
    x: 0.9,
    y: 2.2,
    w: 8,
    h: 1.0,
    fontFace: FONT.heading,
    bold: true,
    color: "FFFFFF",
    fontSize: 72,
    fit: "shrink",
  });

  slide.addText("Questions?", {
    x: 0.9,
    y: 3.45,
    w: 4,
    h: 0.4,
    fontFace: FONT.body,
    color: COLORS.mutedLight,
    fontSize: 22,
  });

  slide.addShape("line", {
    x: 0.9,
    y: 4.2,
    w: 4.8,
    h: 0,
    line: { color: COLORS.pink, pt: 1.4 },
  });

  slide.addText("Roger Rajaratnam", {
    x: 0.9,
    y: 5.1,
    w: 5,
    h: 0.34,
    fontFace: FONT.body,
    color: "FFFFFF",
    fontSize: 16,
  });

  slide.addText("sourcier.uk", {
    x: 0.9,
    y: 5.46,
    w: 5,
    h: 0.3,
    fontFace: FONT.body,
    color: COLORS.pink,
    fontSize: 14,
  });
}

async function main() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Sourcier";
  pptx.company = "Sourcier";
  pptx.subject = "Sourcier presentation template";
  pptx.title = "Sourcier Blog PowerPoint Template";
  pptx.lang = "en-GB";

  addTitleSlide(pptx);
  addSectionSlide(pptx);
  addContentSlide(pptx);
  addQuoteSlide(pptx);
  addImageSlide(pptx);
  addClosingSlide(pptx);

  await mkdir(outputDir, { recursive: true });
  await pptx.writeFile({ fileName: outputFile });

  console.log(`PowerPoint template generated at: ${outputFile}`);
}

main().catch((error) => {
  console.error("Failed to generate PowerPoint template:", error);
  process.exit(1);
});
