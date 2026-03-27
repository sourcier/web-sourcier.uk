// @ts-check
import { defineConfig } from "astro/config";
import emoji from "remark-emoji";
import { transformerNotationDiff } from "@shikijs/transformers";

export default defineConfig({
  site: "https://sourcier.uk",
  markdown: {
    remarkPlugins: [[emoji, { emoticon: true, accessible: true }]],
    shikiConfig: {
      themes: {
        light: "one-light",
        dark: "one-dark-pro",
      },
      defaultColor: false,
      langs: [],
      transformers: [
        {
          // Strip trailing newline to prevent a phantom empty line at the bottom
          preprocess(code) {
            return code.endsWith("\n") ? code.slice(0, -1) : code;
          },
          // Read start=N from the code fence meta and set --start CSS variable
          // Usage: ```js start=10
          code(node) {
            const match = this.options.meta?.__raw?.match(/\bstart=(\d+)\b/);
            if (match) {
              const existing = node.properties.style ?? "";
              node.properties.style = `${existing}--start: ${match[1]};`.trim();
            }
          },
        },
        transformerNotationDiff(),
      ],
      // },
      // ],
    },
    syntaxHighlight: {
      excludeLangs: ["mermaid"],
    },
  },
});
