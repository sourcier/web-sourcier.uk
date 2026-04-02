// Converts ```mermaid blocks to a pre-built container with loading skeleton at build time.
// The skeleton is visible the instant the HTML arrives, before any JS runs.
// The client-side script finds these containers via [data-mermaid] and renders them.
const SKELETON =
  `<div class="mermaid-skeleton" aria-hidden="true">` +
  `<div class="mermaid-skeleton__row">` +
  `<div class="mermaid-skeleton__node mermaid-skeleton__node--wide"></div>` +
  `</div>` +
  `<div class="mermaid-skeleton__connector"></div>` +
  `<div class="mermaid-skeleton__row">` +
  `<div class="mermaid-skeleton__node"></div>` +
  `<div class="mermaid-skeleton__node"></div>` +
  `</div>` +
  `<div class="mermaid-skeleton__connector"></div>` +
  `<div class="mermaid-skeleton__row">` +
  `<div class="mermaid-skeleton__node mermaid-skeleton__node--narrow"></div>` +
  `<div class="mermaid-skeleton__node mermaid-skeleton__node--narrow"></div>` +
  `<div class="mermaid-skeleton__node mermaid-skeleton__node--narrow"></div>` +
  `</div>` +
  `</div>`;

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function remarkMermaid() {
  return (tree) => {
    function walk(node, parent, index) {
      if (node.type === "code" && node.lang === "mermaid" && parent) {
        parent.children[index] = {
          type: "html",
          value: `<div class="mermaid-diagram" data-loading data-mermaid="${escapeAttr(node.value)}">${SKELETON}</div>`,
        };
        return;
      }
      if (node.children) {
        node.children.forEach((child, i) => walk(child, node, i));
      }
    }
    walk(tree, null, null);
  };
}
