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

function addIntroSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);
  addHeader(slide, "About Me", "A quick introduction before we get started.");

  slide.addShape("roundRect", {
    x: 0.5,
    y: 2.25,
    w: 7.2,
    h: 4.55,
    rectRadius: 0.1,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("rect", {
    x: 0.5,
    y: 2.25,
    w: 0.14,
    h: 4.55,
    fill: { color: COLORS.pink },
    line: { color: COLORS.pink, pt: 0 },
  });

  slide.addText("ABOUT ME", {
    x: 0.88,
    y: 2.56,
    w: 1.7,
    h: 0.24,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 12,
    charSpace: 1,
  });

  slide.addText("Roger Rajaratnam", {
    x: 0.88,
    y: 2.88,
    w: 5.8,
    h: 0.52,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 31,
  });

  slide.addText(
    "I help people move into tech, engineers grow, and teams improve how they build software.",
    {
      x: 0.88,
      y: 3.46,
      w: 6.15,
      h: 0.68,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 16,
      fit: "shrink",
      valign: "mid",
    },
  );

  slide.addText(
    "I am a software engineer in London working across product engineering, delivery, mentoring, and team leadership.",
    {
      x: 0.88,
      y: 4.26,
      w: 6.15,
      h: 0.7,
      fontFace: FONT.body,
      color: COLORS.ink,
      fontSize: 16,
      valign: "top",
    },
  );

  slide.addText(
    "I focus on practical engineering improvement: clearer habits, better delivery, and more confidence for the people doing the work.",
    {
      x: 0.88,
      y: 5.02,
      w: 6.15,
      h: 0.82,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 15,
      valign: "top",
    },
  );

  slide.addShape("roundRect", {
    x: 0.88,
    y: 6.05,
    w: 1.72,
    h: 0.44,
    rectRadius: 0.12,
    fill: { color: COLORS.green, transparency: 86 },
    line: { color: COLORS.green, transparency: 100 },
  });

  slide.addText("CAREER CHANGERS", {
    x: 0.98,
    y: 6.16,
    w: 1.52,
    h: 0.18,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 9,
    align: "center",
    fit: "shrink",
  });

  slide.addShape("roundRect", {
    x: 2.78,
    y: 6.05,
    w: 2.08,
    h: 0.44,
    rectRadius: 0.12,
    fill: { color: COLORS.pink, transparency: 88 },
    line: { color: COLORS.pink, transparency: 100 },
  });

  slide.addText("ENGINEERS GROWING", {
    x: 2.91,
    y: 6.16,
    w: 1.82,
    h: 0.18,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.pink,
    fontSize: 9,
    align: "center",
    fit: "shrink",
  });

  slide.addShape("roundRect", {
    x: 5.04,
    y: 6.05,
    w: 2.35,
    h: 0.44,
    rectRadius: 0.12,
    fill: { color: COLORS.warmBottom },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("TEAMS RAISING THE BAR", {
    x: 5.18,
    y: 6.16,
    w: 2.07,
    h: 0.18,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 9,
    align: "center",
    fit: "shrink",
  });

  slide.addShape("roundRect", {
    x: 7.95,
    y: 2.25,
    w: 4.88,
    h: 1.45,
    rectRadius: 0.08,
    fill: { color: COLORS.darkBgBottom },
    line: { color: COLORS.darkBgBottom },
  });

  slide.addShape("rect", {
    x: 7.95,
    y: 2.25,
    w: 4.88,
    h: 0.08,
    fill: { color: COLORS.pink },
    line: { color: COLORS.pink, pt: 0 },
  });

  slide.addText("CURRENTLY", {
    x: 8.22,
    y: 2.54,
    w: 1.3,
    h: 0.18,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.mutedLight,
    fontSize: 10,
    charSpace: 0.9,
  });

  slide.addText("Staff Engineer", {
    x: 8.22,
    y: 2.86,
    w: 3.85,
    h: 0.34,
    fontFace: FONT.heading,
    bold: true,
    color: "FFFFFF",
    fontSize: 23,
    fit: "shrink",
  });

  slide.addText("NewDay · London", {
    x: 8.22,
    y: 3.2,
    w: 3.85,
    h: 0.22,
    fontFace: FONT.body,
    color: COLORS.mutedLight,
    fontSize: 13,
  });

  slide.addShape("roundRect", {
    x: 7.95,
    y: 3.95,
    w: 4.88,
    h: 1.45,
    rectRadius: 0.08,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("TEACHING BACKGROUND", {
    x: 8.22,
    y: 4.22,
    w: 2.2,
    h: 0.18,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 10,
    charSpace: 0.9,
  });

  slide.addText("Full-Stack Bootcamp Instructor", {
    x: 8.22,
    y: 4.53,
    w: 4.15,
    h: 0.36,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 17,
    fit: "shrink",
  });

  slide.addText("The Jump Digital School", {
    x: 8.22,
    y: 4.92,
    w: 3.9,
    h: 0.22,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 13,
  });

  slide.addShape("roundRect", {
    x: 7.95,
    y: 5.65,
    w: 4.88,
    h: 1.15,
    rectRadius: 0.08,
    fill: { color: COLORS.warmTop },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("QUICK FACTS", {
    x: 8.22,
    y: 5.92,
    w: 1.4,
    h: 0.18,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 10,
    charSpace: 0.9,
  });

  slide.addText("Fintech · mentoring · engineering practice", {
    x: 8.22,
    y: 6.2,
    w: 4.1,
    h: 0.3,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 14,
    fit: "shrink",
  });

  addFooter(slide);
}

function addSectionSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);

  addHeader(slide, "Section Heading", "Use this slide to split major themes.");

  slide.addShape("roundRect", {
    x: 0.5,
    y: 2.07,
    w: 1.8,
    h: 0.28,
    rectRadius: 0.14,
    fill: { color: COLORS.green, transparency: 82 },
    line: { color: COLORS.green, transparency: 100 },
  });

  slide.addText("GUIDE BREAK", {
    x: 0.68,
    y: 2.11,
    w: 1.45,
    h: 0.2,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 10,
    charSpace: 1.1,
  });

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

function addGuideMapSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);
  addHeader(
    slide,
    "Guide Map",
    "A fast orientation slide for what to cover next.",
  );

  slide.addShape("roundRect", {
    x: 0.5,
    y: 2.25,
    w: 12.333,
    h: 4.6,
    rectRadius: 0.1,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("line", {
    x: 0.9,
    y: 2.9,
    w: 11.55,
    h: 0,
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("WHERE WE'RE GOING", {
    x: 0.95,
    y: 2.5,
    w: 4.2,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 14,
    charSpace: 1,
  });

  slide.addShape("roundRect", {
    x: 0.95,
    y: 3.25,
    w: 3.7,
    h: 2.95,
    rectRadius: 0.08,
    fill: { color: COLORS.warmTop },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("01", {
    x: 1.22,
    y: 3.45,
    w: 0.6,
    h: 0.26,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.pink,
    fontSize: 16,
  });

  slide.addText("START", {
    x: 1.22,
    y: 3.78,
    w: 2.7,
    h: 0.4,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 27,
  });

  slide.addText("Problem framing and success criteria", {
    x: 1.22,
    y: 4.3,
    w: 3.2,
    h: 1.35,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 15,
    valign: "top",
  });

  slide.addShape("roundRect", {
    x: 4.82,
    y: 3.25,
    w: 3.7,
    h: 2.95,
    rectRadius: 0.08,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("02", {
    x: 5.09,
    y: 3.45,
    w: 0.6,
    h: 0.26,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.green,
    fontSize: 16,
  });

  slide.addText("BUILD", {
    x: 5.09,
    y: 3.78,
    w: 2.7,
    h: 0.4,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 27,
  });

  slide.addText("Approach, trade-offs, and technical decisions", {
    x: 5.09,
    y: 4.3,
    w: 3.2,
    h: 1.35,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 15,
    valign: "top",
  });

  slide.addShape("roundRect", {
    x: 8.69,
    y: 3.25,
    w: 3.7,
    h: 2.95,
    rectRadius: 0.08,
    fill: { color: COLORS.warmBottom },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("03", {
    x: 8.96,
    y: 3.45,
    w: 0.6,
    h: 0.26,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 16,
  });

  slide.addText("SHIP", {
    x: 8.96,
    y: 3.78,
    w: 2.7,
    h: 0.4,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 27,
  });

  slide.addText("Outcomes, metrics, and next guide steps", {
    x: 8.96,
    y: 4.3,
    w: 3.2,
    h: 1.35,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 15,
    valign: "top",
  });

  addFooter(slide);
}

function addContentSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);

  addHeader(
    slide,
    "Working Slide",
    "Two-column layout for argument + evidence.",
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

  slide.addText("Argument", {
    x: 0.86,
    y: 2.72,
    w: 5.2,
    h: 0.38,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 24,
  });

  slide.addText(
    "- Context and constraint\n- Key decision\n- Why this approach won",
    {
      x: 0.86,
      y: 3.25,
      w: 5.2,
      h: 3.1,
      fontFace: FONT.body,
      color: COLORS.ink,
      fontSize: 17,
      breakLine: true,
      valign: "top",
    },
  );

  slide.addText("Evidence", {
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

  slide.addText("Drop chart, screenshot, or code snippet", {
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

function addTechnicalDecisionSlide(pptx) {
  const slide = pptx.addSlide();

  addAtmosphere(slide);
  addHeader(
    slide,
    "Technical Decision",
    "Frame rationale clearly: problem, constraints, decision, and trade-offs.",
  );

  slide.addShape("roundRect", {
    x: 0.5,
    y: 2.25,
    w: 12.333,
    h: 4.6,
    rectRadius: 0.1,
    fill: { color: COLORS.elevated },
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("rect", {
    x: 0.5,
    y: 2.25,
    w: 0.14,
    h: 4.6,
    fill: { color: COLORS.green },
    line: { color: COLORS.green, pt: 0 },
  });

  slide.addShape("line", {
    x: 0.82,
    y: 4.5,
    w: 11.7,
    h: 0,
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addShape("line", {
    x: 6.52,
    y: 2.65,
    w: 0,
    h: 3.95,
    line: { color: COLORS.borderWarm, pt: 1 },
  });

  slide.addText("01  PROBLEM", {
    x: 0.92,
    y: 2.7,
    w: 5.3,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.pink,
    fontSize: 14,
    charSpace: 0.8,
  });

  slide.addText("What is failing, slow, or expensive today?", {
    x: 0.92,
    y: 3.05,
    w: 5.3,
    h: 1.1,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 16,
    valign: "top",
  });

  slide.addText("02  CONSTRAINTS", {
    x: 6.84,
    y: 2.7,
    w: 5.3,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.greenDeep,
    fontSize: 14,
    charSpace: 0.8,
  });

  slide.addText("Latency, cost, team bandwidth, risk, and deadlines.", {
    x: 6.84,
    y: 3.05,
    w: 5.3,
    h: 1.1,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 16,
    valign: "top",
  });

  slide.addText("03  DECISION", {
    x: 0.92,
    y: 4.8,
    w: 5.3,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.green,
    fontSize: 14,
    charSpace: 0.8,
  });

  slide.addText("State the chosen approach in one sentence.", {
    x: 0.92,
    y: 5.15,
    w: 5.3,
    h: 1.1,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 16,
    valign: "top",
  });

  slide.addText("04  TRADE-OFFS", {
    x: 6.84,
    y: 4.8,
    w: 5.3,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.pink,
    fontSize: 14,
    charSpace: 0.8,
  });

  slide.addText(
    "What you gained, what you gave up, and why it is acceptable.",
    {
      x: 6.84,
      y: 5.15,
      w: 5.3,
      h: 1.1,
      fontFace: FONT.body,
      color: COLORS.ink,
      fontSize: 16,
      valign: "top",
    },
  );

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
    x: 0.8,
    y: 2.2,
    w: 11.75,
    h: 4.3,
    flipH: true,
    line: { color: COLORS.border, pt: 1 },
  });

  slide.addText("Replace with screenshot or diagram", {
    x: 5.35,
    y: 4.23,
    w: 2.65,
    h: 0.3,
    align: "center",
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 14,
  });

  slide.addText("Caption: what this shows and why it matters.", {
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
  addIntroSlide(pptx);
  addSectionSlide(pptx);
  addGuideMapSlide(pptx);
  addContentSlide(pptx);
  addTechnicalDecisionSlide(pptx);
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
