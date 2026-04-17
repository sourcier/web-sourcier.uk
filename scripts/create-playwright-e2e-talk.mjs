import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const talkSlug = "playwright-e2e-testing-talk";
const postSlug = "playwright-e2e-testing-talk";
const publicTalksDir = path.join(rootDir, "public", "talks");
const postsDir = path.join(rootDir, "collections", "posts", postSlug);
const talkFile = path.join(publicTalksDir, `${talkSlug}.pptx`);
const coverSourceFile = path.join(postsDir, `${postSlug}-cover-source.jpg`);
const coverFile = path.join(postsDir, `${postSlug}-cover.webp`);
const thumbnailFile = path.join(postsDir, `${postSlug}-thumbnail.webp`);
const publicTalkPath = `/talks/${talkSlug}.pptx`;

const COLORS = {
  pink: "E8006A",
  pinkSoft: "FDEAF2",
  ink: "0F0F0F",
  paper: "FFFFFF",
  muted: "6B6B6B",
  darkBg: "0A0A0A",
  border: "D7D7D7",
  soft: "F6F6F4",
  codeBg: "121212",
  codeLine: "262626",
  green: "2E8B74",
};

const CODE_COLORS = {
  base: "EFEFEF",
  comment: "8C8C8C",
  keyword: "F58AC1",
  string: "F0C15A",
  method: "8BD6C0",
  number: "F4D27A",
  command: "8BD6C0",
};

const FONT = {
  heading: "Barlow Condensed",
  body: "Barlow",
  code: "Menlo",
};

const URLs = {
  jsLondon: "https://www.meetup.com/javascript-london/",
  linkedin: "https://www.linkedin.com/in/roger-rajaratnam",
  website: "https://sourcier.uk",
};

function addHeader(slide, title, subtitle = "") {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.72,
    fill: { color: COLORS.darkBg },
    line: { color: COLORS.darkBg },
  });

  slide.addShape("line", {
    x: 0,
    y: 0.72,
    w: 13.333,
    h: 0,
    line: { color: COLORS.pink, pt: 2.25 },
  });

  slide.addText("SOURCIER", {
    x: 0.5,
    y: 0.17,
    w: 2.8,
    h: 0.3,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.paper,
    fontSize: 18,
    charSpace: 1.25,
  });

  slide.addText(title.toUpperCase(), {
    x: 0.5,
    y: 1.0,
    w: 8.9,
    h: 0.7,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 32,
    fit: "shrink",
    valign: "mid",
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 1.72,
      w: 10.4,
      h: 0.38,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 17,
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
    w: 6.0,
    h: 0.2,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 10,
  });

  addSlideNumber(slide);
}

function addSlideNumber(slide, options = {}) {
  slide.slideNumber = {
    x: 11.75,
    y: 7.08,
    w: 1.1,
    h: 0.2,
    align: "right",
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 10,
    margin: 0,
    ...options,
  };
}

function addCard(
  slide,
  { x, y, w, h, fill = COLORS.paper, line = COLORS.border, radius = 0.08 },
) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: radius,
    fill: { color: fill },
    line: { color: line, pt: 1 },
  });
}

function addLinkBadge(
  slide,
  {
    x,
    y,
    w,
    label,
    url,
    fill = COLORS.soft,
    line = COLORS.border,
    color = COLORS.ink,
  },
) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.52,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: line, pt: 1 },
  });

  slide.addText(label, {
    x: x + 0.14,
    y: y + 0.14,
    w: w - 0.28,
    h: 0.2,
    fontFace: FONT.body,
    color,
    fontSize: 12,
    align: "center",
    fit: "shrink",
    hyperlink: { url },
  });
}

function addBulletList(slide, items, options) {
  slide.addText(items.map((item) => `• ${item}`).join("\n"), {
    ...options,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 18,
    breakLine: true,
    valign: "top",
    fit: "shrink",
    margin: 0,
  });
}

function createCodeRun(text, color = CODE_COLORS.base) {
  return { text, options: { color } };
}

function highlightShellLine(line) {
  return line
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part) => {
      if (/^\s+$/.test(part)) {
        return createCodeRun(part);
      }

      if (/^(pnpm|npm|npx)$/.test(part)) {
        return createCodeRun(part, CODE_COLORS.command);
      }

      if (part.startsWith("--")) {
        return createCodeRun(part, CODE_COLORS.keyword);
      }

      if (
        part.endsWith(".zip") ||
        part.includes("/") ||
        part.startsWith("**/")
      ) {
        return createCodeRun(part, CODE_COLORS.string);
      }

      return createCodeRun(part);
    });
}

function highlightCodeLine(line) {
  if (!line.trim()) {
    return [createCodeRun("")];
  }

  if (/^(pnpm|npm|npx)\b/.test(line.trim())) {
    return highlightShellLine(line);
  }

  if (line.trim().startsWith("//")) {
    return [createCodeRun(line, CODE_COLORS.comment)];
  }

  const tokenPattern =
    /\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/(?:[^/\\]|\\.)+\/[dgimsuvy]*|\.[A-Za-z_][A-Za-z0-9_]*|\b(?:import|from|export|class|constructor|async|await|return|const|let|new|this|test|expect)\b|\b(?:true|false|null)\b|\b\d+\b/g;
  const runs = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    const token = match[0];

    if (index > lastIndex) {
      runs.push(createCodeRun(line.slice(lastIndex, index)));
    }

    if (token.startsWith("//")) {
      runs.push(createCodeRun(token, CODE_COLORS.comment));
    } else if (token.startsWith(".")) {
      runs.push(createCodeRun(token, CODE_COLORS.method));
    } else if (/^["'`]/.test(token) || token.startsWith("/")) {
      runs.push(createCodeRun(token, CODE_COLORS.string));
    } else if (/^(?:true|false|null|\d+)$/.test(token)) {
      runs.push(createCodeRun(token, CODE_COLORS.number));
    } else {
      runs.push(createCodeRun(token, CODE_COLORS.keyword));
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < line.length) {
    runs.push(createCodeRun(line.slice(lastIndex)));
  }

  return runs;
}

function addCodePanel(
  slide,
  { x, y, w, h, title, lines, fontSize = 12, lineGap = 0.3, lineHeight = 0.22 },
) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: COLORS.codeBg },
    line: { color: "1F1F1F", pt: 1 },
  });

  slide.addShape("rect", {
    x,
    y,
    w,
    h: 0.46,
    fill: { color: "1B1B1B" },
    line: { color: "1B1B1B", pt: 0 },
  });

  slide.addText(title, {
    x: x + 0.22,
    y: y + 0.12,
    w: w - 0.44,
    h: 0.16,
    fontFace: FONT.body,
    color: "D9D9D9",
    fontSize: 10,
  });

  lines.forEach((line, index) => {
    slide.addText(highlightCodeLine(line), {
      x: x + 0.26,
      y: y + 0.64 + index * lineGap,
      w: w - 0.52,
      h: lineHeight,
      fontFace: FONT.code,
      color: CODE_COLORS.base,
      fontSize,
      fit: "shrink",
      margin: 0,
    });
  });
}

function addMiniBrowser(slide, { x, y, w, h }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: COLORS.paper },
    line: { color: COLORS.border, pt: 1 },
  });

  slide.addShape("rect", {
    x,
    y,
    w,
    h: 0.42,
    fill: { color: "F3F3F3" },
    line: { color: "F3F3F3", pt: 0 },
  });

  ["E57373", "F0C15A", "7FC97F"].forEach((color, index) => {
    slide.addShape("ellipse", {
      x: x + 0.14 + index * 0.16,
      y: y + 0.12,
      w: 0.08,
      h: 0.08,
      fill: { color },
      line: { color, pt: 0 },
    });
  });

  slide.addShape("roundRect", {
    x: x + 0.7,
    y: y + 0.09,
    w: w - 1.0,
    h: 0.22,
    rectRadius: 0.05,
    fill: { color: COLORS.paper },
    line: { color: "E6E6E6", pt: 1 },
  });

  slide.addText("checkout", {
    x: x + 0.92,
    y: y + 0.13,
    w: 1.3,
    h: 0.12,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 8,
  });

  slide.addText("CHECKOUT", {
    x: x + 0.28,
    y: y + 0.7,
    w: 1.8,
    h: 0.22,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 18,
  });

  slide.addText("Order summary", {
    x: x + 0.28,
    y: y + 1.12,
    w: 1.8,
    h: 0.16,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 10,
  });

  [0, 1, 2].forEach((index) => {
    slide.addShape("rect", {
      x: x + 0.28,
      y: y + 1.46 + index * 0.34,
      w: 2.2,
      h: 0.08,
      fill: { color: index === 0 ? "2D2A3E" : "D7D7D7" },
      line: { color: index === 0 ? "2D2A3E" : "D7D7D7", pt: 0 },
    });
  });

  slide.addShape("roundRect", {
    x: x + 0.28,
    y: y + h - 0.82,
    w: 1.68,
    h: 0.34,
    rectRadius: 0.06,
    fill: { color: COLORS.pink },
    line: { color: COLORS.pink, pt: 0 },
  });

  slide.addText("Place order", {
    x: x + 0.72,
    y: y + h - 0.74,
    w: 0.9,
    h: 0.14,
    fontFace: FONT.body,
    color: COLORS.paper,
    fontSize: 9,
    align: "center",
  });
}

function addTitleSlide(pptx) {
  const slide = pptx.addSlide();

  slide.background = { color: COLORS.darkBg };

  slide.addShape("roundRect", {
    x: 9.4,
    y: -1.3,
    w: 5.5,
    h: 5.5,
    rectRadius: 0.3,
    fill: { color: COLORS.pink, transparency: 74 },
    line: { color: COLORS.pink, transparency: 100 },
  });

  slide.addShape("roundRect", {
    x: -2.1,
    y: 4.9,
    w: 5.2,
    h: 3.5,
    rectRadius: 0.3,
    fill: { color: COLORS.paper, transparency: 93 },
    line: { color: COLORS.paper, transparency: 100 },
  });

  slide.addText("SOURCIER", {
    x: 0.8,
    y: 0.8,
    w: 3.2,
    h: 0.4,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.paper,
    fontSize: 26,
    charSpace: 1.4,
  });

  slide.addShape("line", {
    x: 0.8,
    y: 1.33,
    w: 2.7,
    h: 0,
    line: { color: COLORS.pink, pt: 2.5 },
  });

  slide.addText("SHIP WITH\nCONFIDENCE", {
    x: 0.8,
    y: 2.0,
    w: 6.2,
    h: 1.6,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.paper,
    fontSize: 40,
    breakLine: true,
    fit: "shrink",
    margin: 0,
  });

  slide.addText("End-to-end testing with Playwright", {
    x: 0.8,
    y: 3.75,
    w: 5.8,
    h: 0.35,
    fontFace: FONT.body,
    color: "E5E5E5",
    fontSize: 20,
  });

  slide.addText("A 10-minute intro for junior and mid-level engineers", {
    x: 0.8,
    y: 4.18,
    w: 6.2,
    h: 0.28,
    fontFace: FONT.body,
    color: "C9C9C9",
    fontSize: 14,
  });

  slide.addText("JavaScript London · April 2026", {
    x: 0.8,
    y: 4.52,
    w: 4.1,
    h: 0.24,
    fontFace: FONT.body,
    color: COLORS.pink,
    fontSize: 12,
    hyperlink: { url: URLs.jsLondon },
  });

  addMiniBrowser(slide, { x: 7.55, y: 1.6, w: 4.8, h: 3.5 });
  addCodePanel(slide, {
    x: 6.9,
    y: 4.22,
    w: 5.45,
    h: 1.95,
    title: "playwright test",
    lines: [
      'test("checkout works", async ({ page }) => {',
      '  await page.goto("/checkout");',
      '  await page.getByRole("button",',
      '    { name: "Place order" }).click();',
      '  await expect(page.getByText("Order confirmed")).toBeVisible();',
      "});",
    ],
    fontSize: 10.5,
    lineGap: 0.24,
    lineHeight: 0.19,
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
    hyperlink: { url: URLs.website },
  });
}

function addSpeakerIntroSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "About the speaker",
    "A short intro before we get into the testing trade-offs.",
  );

  addCard(slide, {
    x: 0.7,
    y: 2.2,
    w: 7.1,
    h: 3.95,
    fill: COLORS.paper,
    line: COLORS.pink,
    radius: 0.12,
  });
  addCard(slide, {
    x: 8.1,
    y: 2.2,
    w: 4.55,
    h: 3.95,
    fill: COLORS.soft,
    line: COLORS.border,
    radius: 0.12,
  });

  slide.addText("ROGER RAJARATNAM", {
    x: 1.02,
    y: 2.58,
    w: 4.7,
    h: 0.34,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 28,
  });

  slide.addText("Staff Engineer at NewDay", {
    x: 1.02,
    y: 3.02,
    w: 4.6,
    h: 0.24,
    fontFace: FONT.body,
    color: COLORS.pink,
    fontSize: 16,
  });

  addBulletList(
    slide,
    [
      "I work at NewDay, focusing on technical leadership, delivery, and mentoring.",
      "I write about software engineering, frontend tooling, and pragmatic architecture at sourcier.uk.",
      "This version of the talk is for JavaScript London, so I am keeping it practical and beginner-friendly.",
    ],
    { x: 1.02, y: 3.5, w: 6.15, h: 1.85 },
  );

  slide.addText("Find me", {
    x: 8.45,
    y: 2.58,
    w: 1.5,
    h: 0.24,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 22,
  });

  slide.addText("All links below are clickable in the exported deck.", {
    x: 8.45,
    y: 2.98,
    w: 3.65,
    h: 0.34,
    fontFace: FONT.body,
    color: COLORS.muted,
    fontSize: 13,
  });

  addLinkBadge(slide, {
    x: 8.45,
    y: 3.92,
    w: 3.8,
    label: "Website · sourcier.uk",
    url: URLs.website,
    fill: COLORS.paper,
  });

  addLinkBadge(slide, {
    x: 8.45,
    y: 4.62,
    w: 3.8,
    label: "LinkedIn · /in/roger-rajaratnam",
    url: URLs.linkedin,
    fill: COLORS.paper,
  });

  addFooter(slide, "sourcier.uk / Roger Rajaratnam");
}

function addHookSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "The Bug Unit Tests Can't Find",
    "Users experience the assembled product, not the isolated parts.",
  );

  addCard(slide, {
    x: 1.15,
    y: 2.35,
    w: 11.0,
    h: 3.55,
    fill: COLORS.paper,
    line: COLORS.pink,
    radius: 0.12,
  });

  slide.addText('"', {
    x: 1.55,
    y: 2.55,
    w: 0.7,
    h: 0.7,
    fontFace: FONT.heading,
    color: COLORS.pink,
    fontSize: 70,
  });

  slide.addText("All your unit tests pass. Your users are still angry.", {
    x: 2.1,
    y: 3.1,
    w: 9.0,
    h: 1.2,
    fontFace: FONT.body,
    color: COLORS.ink,
    fontSize: 28,
    italic: true,
    align: "center",
    valign: "mid",
    fit: "shrink",
  });

  slide.addText(
    "E2E tests answer a different question: can a real user complete the journey in a real browser?",
    {
      x: 2.0,
      y: 4.65,
      w: 9.2,
      h: 0.42,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 17,
      align: "center",
    },
  );

  addFooter(slide, "sourcier.uk / End-to-end testing with Playwright");
}

function addPyramidSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "Where E2E Fits",
    "A few high-signal tests at the top of the pyramid.",
  );

  addBulletList(
    slide,
    [
      "Unit tests check small pieces quickly.",
      "Integration tests check boundaries and contracts.",
      "E2E tests protect the journeys users actually depend on.",
      "Aim for risk coverage, not blanket coverage.",
    ],
    { x: 0.8, y: 2.45, w: 5.2, h: 3.4 },
  );

  const blocks = [
    {
      x: 8.0,
      y: 4.95,
      w: 3.85,
      h: 0.78,
      color: COLORS.soft,
      label: "Many unit tests",
    },
    {
      x: 8.45,
      y: 4.0,
      w: 2.95,
      h: 0.78,
      color: COLORS.pinkSoft,
      label: "Some integration tests",
    },
    {
      x: 8.9,
      y: 3.05,
      w: 2.05,
      h: 0.78,
      color: COLORS.pink,
      label: "Few E2E tests",
    },
  ];

  blocks.forEach((block, index) => {
    slide.addShape("roundRect", {
      x: block.x,
      y: block.y,
      w: block.w,
      h: block.h,
      rectRadius: 0.06,
      fill: { color: block.color },
      line: { color: index === 2 ? COLORS.pink : COLORS.border, pt: 1 },
    });

    slide.addText(block.label, {
      x: block.x + 0.12,
      y: block.y + 0.22,
      w: block.w - 0.24,
      h: 0.2,
      fontFace: FONT.heading,
      bold: true,
      color: index === 2 ? COLORS.paper : COLORS.ink,
      fontSize: 18,
      align: "center",
    });
  });

  slide.addText(
    "Protect the 3-5 paths where failure would actually hurt users.",
    {
      x: 7.35,
      y: 5.95,
      w: 5.15,
      h: 0.4,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 15,
      align: "center",
    },
  );

  addFooter(slide, "sourcier.uk / Use E2E for critical journeys");
}

function addCatchSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "What E2E Sees",
    "The browser runtime is where the seams show.",
  );

  addCard(slide, {
    x: 0.55,
    y: 2.35,
    w: 5.95,
    h: 4.2,
    fill: COLORS.paper,
    line: COLORS.border,
  });
  addCard(slide, {
    x: 6.83,
    y: 2.35,
    w: 5.95,
    h: 4.2,
    fill: COLORS.paper,
    line: COLORS.border,
  });

  slide.addText("Great At Catching", {
    x: 0.9,
    y: 2.72,
    w: 5.0,
    h: 0.25,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 24,
  });

  addBulletList(
    slide,
    [
      "Broken auth and redirect flows.",
      "Forms that submit the wrong thing or nothing at all.",
      "Buttons hidden by banners, overlays, or layout regressions.",
      "Browser-specific navigation and storage issues.",
    ],
    { x: 0.9, y: 3.18, w: 5.0, h: 2.95 },
  );

  slide.addText("Better Covered Elsewhere", {
    x: 7.18,
    y: 2.72,
    w: 5.0,
    h: 0.25,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 24,
  });

  addBulletList(
    slide,
    [
      "Business rules and algorithm edge cases.",
      "Small component state changes.",
      "Pure validation logic.",
      "Anything a unit test can check in seconds.",
    ],
    { x: 7.18, y: 3.18, w: 5.0, h: 2.95 },
  );

  addFooter(slide, "sourcier.uk / E2E covers journeys, not everything");
}

function addWhyPlaywrightSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "Why Playwright",
    "A pragmatic default for modern browser automation.",
  );

  addBulletList(
    slide,
    [
      "Cross-browser support out of the box: Chromium, Firefox, and WebKit.",
      "Auto-waiting removes most timing hacks and sleep calls.",
      "TypeScript-first APIs with a clean test runner.",
      "Codegen gives you a fast starting point for real flows.",
      "Trace Viewer makes CI failures debuggable instead of mysterious.",
    ],
    { x: 0.75, y: 2.45, w: 6.15, h: 3.7 },
  );

  addCodePanel(slide, {
    x: 7.25,
    y: 2.35,
    w: 5.1,
    h: 2.05,
    title: "getting started",
    lines: [
      "pnpm create playwright@latest",
      "pnpm playwright test",
      "pnpm playwright show-trace trace.zip",
    ],
  });

  addCard(slide, {
    x: 7.25,
    y: 4.65,
    w: 5.1,
    h: 1.55,
    fill: COLORS.pinkSoft,
    line: COLORS.pink,
  });
  slide.addText("Honest comparison", {
    x: 7.55,
    y: 4.95,
    w: 2.0,
    h: 0.22,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 18,
  });
  slide.addText(
    "Cypress is also good. Playwright pulls ahead when you need multi-browser coverage, multiple tabs, or better debugging in CI.",
    {
      x: 7.55,
      y: 5.28,
      w: 4.45,
      h: 0.72,
      fontFace: FONT.body,
      color: COLORS.ink,
      fontSize: 14,
      fit: "shrink",
    },
  );

  addFooter(slide, "sourcier.uk / Tooling should reduce friction");
}

function addFirstTestSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "Your First Useful Test",
    "Assert the outcome a real user cares about.",
  );

  addCodePanel(slide, {
    x: 0.55,
    y: 2.2,
    w: 7.45,
    h: 4.55,
    title: "tests/newsletter.spec.ts",
    lines: [
      'import { test, expect } from "@playwright/test";',
      "",
      'test("newsletter signup works", async ({ page }) => {',
      '  await page.goto("/newsletter");',
      '  await page.getByLabel("Email").fill("alice@example.com");',
      '  await page.getByRole("button", { name: "Subscribe" }).click();',
      '  await expect(page.getByText("Check your inbox")).toBeVisible();',
      "});",
    ],
  });

  addCard(slide, {
    x: 8.32,
    y: 2.2,
    w: 4.45,
    h: 4.55,
    fill: COLORS.paper,
    line: COLORS.border,
  });
  slide.addText("What to notice", {
    x: 8.65,
    y: 2.55,
    w: 2.5,
    h: 0.25,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 22,
  });
  addBulletList(
    slide,
    [
      "Use role and label locators first.",
      "Let Playwright wait for the element to be actionable.",
      "Assert the visible success state, not an implementation detail.",
      "If the test reads like a user journey, you're on the right track.",
    ],
    { x: 8.65, y: 3.0, w: 3.6, h: 2.7 },
  );

  slide.addShape("line", {
    x: 8.65,
    y: 5.98,
    w: 3.45,
    h: 0,
    line: { color: COLORS.pink, pt: 1.4 },
  });

  slide.addText(
    "No sleeps. No brittle CSS selectors. No hidden implementation coupling.",
    {
      x: 8.65,
      y: 6.1,
      w: 3.55,
      h: 0.42,
      fontFace: FONT.body,
      color: COLORS.muted,
      fontSize: 12,
      fit: "shrink",
    },
  );

  addFooter(slide, "sourcier.uk / Start with one realistic journey");
}

function addReliabilitySlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "Keep Your Tests Honest",
    "Flaky tests are a trust problem before they are a tooling problem.",
  );

  addCard(slide, {
    x: 0.55,
    y: 2.25,
    w: 5.9,
    h: 2.15,
    fill: COLORS.paper,
    line: COLORS.border,
  });
  addCard(slide, {
    x: 0.55,
    y: 4.65,
    w: 5.9,
    h: 1.8,
    fill: COLORS.pinkSoft,
    line: COLORS.pink,
  });
  addCard(slide, {
    x: 6.82,
    y: 2.25,
    w: 5.95,
    h: 4.2,
    fill: COLORS.paper,
    line: COLORS.border,
  });

  slide.addText("Avoid", {
    x: 0.9,
    y: 2.6,
    w: 2.0,
    h: 0.22,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 22,
  });
  addBulletList(
    slide,
    [
      "waitForTimeout and arbitrary sleeps.",
      "Selectors tied to styling classes.",
      "Shared test data and leaked state.",
    ],
    { x: 0.9, y: 3.0, w: 5.0, h: 1.0 },
  );

  slide.addText("Rule of thumb", {
    x: 0.9,
    y: 4.98,
    w: 2.0,
    h: 0.22,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.ink,
    fontSize: 22,
  });
  slide.addText(
    "If you need `waitForTimeout(2000)`, assume the test still isn't stable. Find the real signal to wait on instead.",
    {
      x: 0.9,
      y: 5.35,
      w: 5.0,
      h: 0.72,
      fontFace: FONT.body,
      color: COLORS.ink,
      fontSize: 16,
      fit: "shrink",
    },
  );

  addCodePanel(slide, {
    x: 7.15,
    y: 2.55,
    w: 5.3,
    h: 3.35,
    title: "better waiting",
    lines: [
      'await page.getByRole("button", { name: "Pay now" }).click();',
      'await expect(page.getByText("Payment complete")).toBeVisible();',
      "",
      "// when you really need explicit waits",
      'await page.waitForURL("**/confirmation");',
      "await page.waitForResponse(/api\\/orders/);",
    ],
  });

  addFooter(slide, "sourcier.uk / Reliability beats raw test count");
}

function addMaintainabilitySlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "Make Change Cheaper",
    "Stable selectors and small page objects keep suites alive.",
  );

  addBulletList(
    slide,
    [
      "Use accessible locators first: role, label, text.",
      "Add `data-testid` only when the UI has no good semantic handle.",
      "Extract repeated actions into page objects once two or three tests share them.",
      "The goal is readable tests and one place to change selectors.",
    ],
    { x: 0.75, y: 2.45, w: 5.75, h: 3.7 },
  );

  addCodePanel(slide, {
    x: 6.9,
    y: 2.25,
    w: 5.55,
    h: 4.55,
    title: "pages/LoginPage.ts",
    lines: [
      "export class LoginPage {",
      "  constructor(page) { this.page = page; }",
      '  email = this.page.getByLabel("Email");',
      '  password = this.page.getByLabel("Password");',
      '  submit = this.page.getByTestId("login-submit");',
      "  async login(email, password) {",
      "    await this.email.fill(email);",
      "    await this.password.fill(password);",
      "    await this.submit.click();",
      "  }",
      "}",
    ],
  });

  addFooter(slide, "sourcier.uk / Maintainability is part of test quality");
}

function addTraceSlide(pptx) {
  const slide = pptx.addSlide();

  addHeader(
    slide,
    "Run In CI. Debug With Traces.",
    "When a remote test fails, you need evidence, not guesses.",
  );

  addBulletList(
    slide,
    [
      "Run headless in CI and save traces on failure or retry.",
      "The trace captures clicks, screenshots, console, network, and timing.",
      "Open it locally and replay the failure like a black box recorder.",
      "This is where Playwright feels better than many older tools.",
    ],
    { x: 0.75, y: 2.45, w: 5.7, h: 3.6 },
  );

  addCard(slide, {
    x: 6.9,
    y: 2.35,
    w: 5.65,
    h: 3.9,
    fill: COLORS.soft,
    line: COLORS.border,
  });
  [
    { x: 7.28, y: 2.85, w: 1.55, label: "Failing test" },
    { x: 9.0, y: 2.85, w: 1.55, label: "Trace artifact" },
    { x: 10.72, y: 2.85, w: 1.55, label: "Open locally" },
  ].forEach((box, index) => {
    slide.addShape("roundRect", {
      x: box.x,
      y: box.y,
      w: box.w,
      h: 0.72,
      rectRadius: 0.05,
      fill: { color: index === 1 ? COLORS.pinkSoft : COLORS.paper },
      line: { color: index === 1 ? COLORS.pink : COLORS.border, pt: 1 },
    });
    slide.addText(box.label, {
      x: box.x + 0.1,
      y: box.y + 0.2,
      w: box.w - 0.2,
      h: 0.18,
      fontFace: FONT.heading,
      bold: true,
      color: COLORS.ink,
      fontSize: 16,
      align: "center",
    });
  });

  [8.83, 10.55].forEach((x) => {
    slide.addShape("chevron", {
      x,
      y: 3.02,
      w: 0.22,
      h: 0.32,
      fill: { color: COLORS.pink },
      line: { color: COLORS.pink, pt: 0 },
    });
  });

  addCodePanel(slide, {
    x: 7.25,
    y: 4.15,
    w: 4.95,
    h: 1.55,
    title: "debugging commands",
    lines: [
      "pnpm playwright test --trace=on-first-retry",
      "pnpm playwright show-trace trace.zip",
    ],
  });

  addFooter(slide, "sourcier.uk / CI failures should be inspectable");
}

function addClosingSlide(pptx) {
  const slide = pptx.addSlide();

  slide.background = { color: COLORS.darkBg };

  slide.addShape("roundRect", {
    x: 8.7,
    y: -1.8,
    w: 6.4,
    h: 6.4,
    rectRadius: 0.3,
    fill: { color: COLORS.pink, transparency: 70 },
    line: { color: COLORS.pink, transparency: 100 },
  });

  slide.addText("START SMALL", {
    x: 0.9,
    y: 1.6,
    w: 6.5,
    h: 0.9,
    fontFace: FONT.heading,
    bold: true,
    color: COLORS.paper,
    fontSize: 58,
    fit: "shrink",
  });

  slide.addText("Three things to do on Monday:", {
    x: 0.9,
    y: 2.75,
    w: 4.5,
    h: 0.28,
    fontFace: FONT.body,
    color: "D8D8D8",
    fontSize: 20,
  });

  [
    "Pick one critical user journey.",
    "Use semantic locators before brittle selectors.",
    "Treat flaky tests as bugs, not background noise.",
  ].forEach((line, index) => {
    slide.addText(`• ${line}`, {
      x: 1.0,
      y: 3.35 + index * 0.58,
      w: 6.0,
      h: 0.24,
      fontFace: FONT.body,
      color: COLORS.paper,
      fontSize: 19,
    });
  });

  slide.addShape("line", {
    x: 0.9,
    y: 5.45,
    w: 4.8,
    h: 0,
    line: { color: COLORS.pink, pt: 1.4 },
  });

  slide.addText("Questions?", {
    x: 0.9,
    y: 5.72,
    w: 4.0,
    h: 0.35,
    fontFace: FONT.body,
    color: "D8D8D8",
    fontSize: 22,
  });

  slide.addText("Roger Rajaratnam", {
    x: 0.9,
    y: 6.45,
    w: 5,
    h: 0.24,
    fontFace: FONT.body,
    color: COLORS.paper,
    fontSize: 16,
  });

  slide.addText(
    [
      {
        text: "sourcier.uk",
        options: { color: COLORS.pink, hyperlink: { url: URLs.website } },
      },
      { text: "  ·  ", options: { color: "C9C9C9" } },
      {
        text: "LinkedIn",
        options: { color: COLORS.pink, hyperlink: { url: URLs.linkedin } },
      },
    ],
    {
      x: 0.9,
      y: 6.78,
      w: 5.8,
      h: 0.2,
      fontFace: FONT.body,
      fontSize: 14,
    },
  );

  addSlideNumber(slide, { color: "BDBDBD" });
}

function buildCoverSvg() {
  return `
    <svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="900" fill="#0A0A0A"/>
      <rect x="1130" y="-120" width="520" height="520" rx="48" fill="#E8006A" fill-opacity="0.22"/>
      <rect x="-140" y="700" width="500" height="320" rx="44" fill="#FFFFFF" fill-opacity="0.07"/>
      <text x="96" y="96" fill="#FFFFFF" font-size="34" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" letter-spacing="3">SOURCIER</text>
      <rect x="96" y="118" width="210" height="7" fill="#E8006A"/>
      <text x="96" y="252" fill="#FFFFFF" font-size="96" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800">END-TO-END</text>
      <text x="96" y="352" fill="#FFFFFF" font-size="96" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800">TESTING</text>
      <text x="96" y="452" fill="#E8006A" font-size="96" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800">WITH PLAYWRIGHT</text>
      <text x="96" y="534" fill="#D8D8D8" font-size="34" font-family="Barlow, Arial, sans-serif">A practical starting point for junior and mid-level engineers</text>

      <rect x="936" y="166" width="540" height="356" rx="22" fill="#FFFFFF" stroke="#D7D7D7" stroke-width="3"/>
      <rect x="936" y="166" width="540" height="44" rx="22" fill="#F4F4F4"/>
      <circle cx="972" cy="188" r="7" fill="#E57373"/>
      <circle cx="997" cy="188" r="7" fill="#F0C15A"/>
      <circle cx="1022" cy="188" r="7" fill="#7FC97F"/>
      <rect x="1080" y="177" width="328" height="20" rx="10" fill="#FFFFFF" stroke="#E5E5E5"/>
      <text x="1102" y="191" fill="#6B6B6B" font-size="12" font-family="Barlow, Arial, sans-serif">/checkout</text>
      <text x="976" y="256" fill="#0F0F0F" font-size="28" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800">CHECKOUT</text>
      <text x="976" y="292" fill="#6B6B6B" font-size="18" font-family="Barlow, Arial, sans-serif">Order summary</text>
      <rect x="976" y="334" width="214" height="12" rx="6" fill="#2D2A3E"/>
      <rect x="976" y="364" width="242" height="12" rx="6" fill="#C9C9C9"/>
      <rect x="976" y="394" width="196" height="12" rx="6" fill="#C9C9C9"/>
      <rect x="976" y="450" width="174" height="42" rx="21" fill="#E8006A"/>
      <text x="1031" y="476" fill="#FFFFFF" font-size="18" font-family="Barlow, Arial, sans-serif" font-weight="700">Place order</text>

      <rect x="860" y="510" width="560" height="258" rx="22" fill="#121212" stroke="#1F1F1F" stroke-width="3"/>
      <rect x="860" y="510" width="560" height="40" rx="22" fill="#1B1B1B"/>
      <text x="888" y="535" fill="#D9D9D9" font-size="14" font-family="Barlow, Arial, sans-serif">checkout.spec.ts</text>
      <text x="890" y="590" fill="#8BD6C0" font-size="22" font-family="Menlo, Monaco, monospace">test(&quot;checkout works&quot;, async ({ page }) =&gt; {</text>
      <text x="890" y="632" fill="#EFEFEF" font-size="22" font-family="Menlo, Monaco, monospace">  await page.goto(&quot;/checkout&quot;);</text>
      <text x="890" y="674" fill="#EFEFEF" font-size="22" font-family="Menlo, Monaco, monospace">  await page.getByRole(&quot;button&quot;, { name: &quot;Place order&quot; }).click();</text>
      <text x="890" y="716" fill="#EFEFEF" font-size="22" font-family="Menlo, Monaco, monospace">  await expect(page.getByText(&quot;Order confirmed&quot;)).toBeVisible();</text>
      <text x="890" y="758" fill="#EFEFEF" font-size="22" font-family="Menlo, Monaco, monospace">});</text>
    </svg>
  `;
}

async function createCoverAssets() {
  try {
    await access(coverSourceFile);

    await sharp(coverSourceFile)
      .resize(1600, 900, { fit: "cover", position: "centre" })
      .webp({ quality: 92 })
      .toFile(coverFile);

    await sharp(coverSourceFile)
      .resize(96, 96, { fit: "cover", position: sharp.strategy.entropy })
      .webp({ quality: 88 })
      .toFile(thumbnailFile);

    return;
  } catch {
    const svg = buildCoverSvg();
    const coverBuffer = await sharp(Buffer.from(svg))
      .webp({ quality: 92 })
      .toBuffer();

    await sharp(coverBuffer).toFile(coverFile);
    await sharp(coverBuffer)
      .resize(96, 96, { fit: "cover", position: "centre" })
      .webp({ quality: 88 })
      .toFile(thumbnailFile);
  }
}

async function createTalkDeck() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Roger Rajaratnam";
  pptx.company = "Sourcier";
  pptx.subject =
    "10 minute talk on end-to-end testing with Playwright for JavaScript London";
  pptx.title = "Ship With Confidence: End-to-End Testing With Playwright";
  pptx.lang = "en-GB";

  addTitleSlide(pptx);
  addSpeakerIntroSlide(pptx);
  addHookSlide(pptx);
  addPyramidSlide(pptx);
  addCatchSlide(pptx);
  addWhyPlaywrightSlide(pptx);
  addFirstTestSlide(pptx);
  addReliabilitySlide(pptx);
  addMaintainabilitySlide(pptx);
  addTraceSlide(pptx);
  addClosingSlide(pptx);

  await pptx.writeFile({ fileName: talkFile });
}

async function main() {
  await mkdir(publicTalksDir, { recursive: true });
  await mkdir(postsDir, { recursive: true });
  await createCoverAssets();
  await createTalkDeck();

  console.log(`Talk deck generated at: ${talkFile}`);
  console.log(`Public download generated at: ${publicTalkPath}`);
  console.log(`Cover generated at: ${coverFile}`);
  console.log(`Thumbnail generated at: ${thumbnailFile}`);
}

main().catch((error) => {
  console.error("Failed to create Playwright talk assets:", error);
  process.exit(1);
});
