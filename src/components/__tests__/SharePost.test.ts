import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import SharePost from "../SharePost.astro";
import { normalizeHtml } from "../../test/helpers";

const baseProps = {
  title: "How to build a blog with Astro",
  url: "https://sourcier.uk/blog/how-this-blog-was-built/",
};

describe("SharePost", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders default variant", async () => {
    const html = await container.renderToString(SharePost, {
      props: baseProps,
    });
    expect(normalizeHtml(html)).toMatchSnapshot();
  });

  it("renders vertical layout", async () => {
    const html = await container.renderToString(SharePost, {
      props: { ...baseProps, vertical: true },
    });
    expect(normalizeHtml(html)).toMatchSnapshot();
  });

  it("renders hero variant", async () => {
    const html = await container.renderToString(SharePost, {
      props: { ...baseProps, variant: "hero" },
    });
    expect(normalizeHtml(html)).toMatchSnapshot();
  });

  it("renders sidebar variant", async () => {
    const html = await container.renderToString(SharePost, {
      props: { ...baseProps, variant: "sidebar" },
    });
    expect(normalizeHtml(html)).toMatchSnapshot();
  });

  it("encodes the url in share links", async () => {
    const html = await container.renderToString(SharePost, {
      props: baseProps,
    });
    expect(normalizeHtml(html)).toContain(encodeURIComponent(baseProps.url));
  });
});
