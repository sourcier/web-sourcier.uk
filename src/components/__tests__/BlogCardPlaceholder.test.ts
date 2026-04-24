import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import BlogCardPlaceholder from "../BlogCardPlaceholder.astro";
import { normalizeHtml } from "../../test/helpers";

describe("BlogCardPlaceholder", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders the placeholder card", async () => {
    const html = await container.renderToString(BlogCardPlaceholder);
    expect(normalizeHtml(html)).toMatchSnapshot();
  });
});
