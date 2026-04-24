import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import MailingListCTA from "./MailingListCTA.astro";
import { normalizeHtml } from "../test/helpers";

describe("MailingListCTA", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders the mailing list sign-up section", async () => {
    const normalized = normalizeHtml(
      await container.renderToString(MailingListCTA),
    );
    expect(normalized).toContain('id="mailing-cta-form"');
    expect(normalized).toContain('type="email"');
  });
});
