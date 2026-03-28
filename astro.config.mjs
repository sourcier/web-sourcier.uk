// @ts-check
import { defineConfig } from "astro/config";
import emoji from "remark-emoji";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

export default defineConfig({
  site: "https://sourcier.uk",
  integrations: [
    expressiveCode({
      themes: ["one-light", "one-dark-pro"],
      plugins: [pluginLineNumbers()],
      defaultProps: {
        showLineNumbers: true,
        wrap: true,
        overridesByLang: {
          "bash,sh,zsh": { preserveIndent: false },
        },
      },
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark"
          ? '[data-theme="dark"]'
          : ':root:not([data-theme="dark"])',
    }),
  ],
  markdown: {
    remarkPlugins: [[emoji, { emoticon: true, accessible: true }]],
    syntaxHighlight: false,
  },
});
