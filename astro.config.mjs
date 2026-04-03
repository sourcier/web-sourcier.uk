// @ts-check
import { defineConfig } from "astro/config";
import emoji from "remark-emoji";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";
import { rehypeZoomableImages } from "./src/plugins/rehype-zoomable-images.js";
import { expressiveCodeCopyIcon } from "./src/utils/expressive-code-copy-icon.js";

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
      styleOverrides: {
        borderRadius: "6px",
        borderColor: "var(--color-border)",
        borderWidth: "1px",
        codePaddingInline: "1.5rem",
        frames: {
          copyIcon: expressiveCodeCopyIcon,
          frameBoxShadowCssValue: "none",
          inlineButtonBackground: "#e8006a",
          inlineButtonBackgroundHoverOrFocusOpacity: "0.15",
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
    remarkPlugins: [
      remarkMermaid,
      [emoji, { emoticon: true, accessible: true }],
    ],
    rehypePlugins: [rehypeZoomableImages],
    syntaxHighlight: false,
  },
});
