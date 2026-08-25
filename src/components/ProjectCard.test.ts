import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import ProjectCard from "./ProjectCard.astro";
import { normalizeHtml } from "../test/helpers";

const baseProps = {
  slug: "nioh2-save-editor",
  name: "Nioh 2 Save Editor",
  summary: "A cross-platform Electron desktop app for editing Nioh 2 saves.",
  status: "Active" as const,
  techStack: ["TypeScript", "Electron"],
  repoUrl: "https://github.com/sourcier/nioh2-save-editor",
};

describe("ProjectCard", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders the project name, status, and tags", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: baseProps,
    });
    const normalized = normalizeHtml(html);
    expect(normalized).toContain("Nioh 2 Save Editor");
    expect(normalized).toContain("Active");
    expect(normalized).toContain("TypeScript");
  });

  it("links to the GitHub repo", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: baseProps,
    });
    expect(normalizeHtml(html)).toContain(
      'href="https://github.com/sourcier/nioh2-save-editor"',
    );
  });

  it("omits the homepage link when not provided", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: baseProps,
    });
    expect(normalizeHtml(html)).not.toContain("Visit site");
  });

  it("renders the homepage link when provided", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: { ...baseProps, homepageUrl: "https://example.com" },
    });
    expect(normalizeHtml(html)).toContain("Visit site");
  });

  it("renders the tagline when provided", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: { ...baseProps, tagline: "A desktop save editor" },
    });
    expect(normalizeHtml(html)).toContain("A desktop save editor");
  });

  it("omits the tagline when not provided", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: baseProps,
    });
    expect(normalizeHtml(html)).not.toContain("A desktop save editor");
  });

  it("renders preview card labels when previewCards are provided", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: {
        ...baseProps,
        previewCards: [
          { label: "Nioh 2", sublabel: "PC & PS4", accentColor: "#4a1515" },
          { label: "Nioh 3", sublabel: "PC", accentColor: "#0f2d3a" },
        ],
      },
    });
    const normalized = normalizeHtml(html);
    // "Nioh 3" and "PC & PS4" only exist inside the preview pane
    expect(normalized).toContain("Nioh 3");
    expect(normalized).toContain("PC &amp; PS4");
  });

  it("omits the preview pane when previewCards are not provided", async () => {
    const html = await container.renderToString(ProjectCard, {
      props: baseProps,
    });
    // "Select →" only appears as the game card CTA inside the preview pane
    expect(normalizeHtml(html)).not.toContain("Select →");
  });
});
