// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import emoji from "remark-emoji";

export default defineConfig({
  site: "https://sourcier.uk",
  integrations: [react()],
  markdown: {
    remarkPlugins: [[emoji, { emoticon: true, accessible: true }]],
    shikiConfig: {
      theme: "dracula",
      langs: [],
    },
    syntaxHighlight: {
      excludeLangs: ["mermaid"],
    },
  },
});
