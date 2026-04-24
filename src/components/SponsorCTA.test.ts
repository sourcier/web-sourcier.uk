import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import SponsorCTA from "./SponsorCTA.astro";
import { normalizeHtml } from "../test/helpers";

describe("SponsorCTA", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders article mode with full placement (defaults)", async () => {
    const normalized = normalizeHtml(
      await container.renderToString(SponsorCTA),
    );
    expect(normalized).toContain("support-cta--article");
    expect(normalized).toContain("support-cta--full");
  });

  it("renders support mode", async () => {
    const html = await container.renderToString(SponsorCTA, {
      props: { mode: "support" },
    });
    expect(normalizeHtml(html)).toContain("support-cta--support");
  });

  it("renders sidebar placement", async () => {
    const html = await container.renderToString(SponsorCTA, {
      props: { placement: "sidebar" },
    });
    expect(normalizeHtml(html)).toContain("support-cta--sidebar");
  });
});
