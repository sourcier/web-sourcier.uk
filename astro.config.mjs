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
      themes: {
        light: "one-light",
        dark: "one-dark-pro",
      },
      defaultColor: false,
      langs: [],
    },
    syntaxHighlight: {
      excludeLangs: ["mermaid"],
    },
  },
});
