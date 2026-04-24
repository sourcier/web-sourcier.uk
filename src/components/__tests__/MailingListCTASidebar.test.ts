import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import MailingListCTASidebar from "../MailingListCTASidebar.astro";
import { normalizeHtml } from "../../test/helpers";

describe("MailingListCTASidebar", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders the sidebar subscribe widget", async () => {
    const html = await container.renderToString(MailingListCTASidebar);
    expect(normalizeHtml(html)).toMatchSnapshot();
  });
});
