// Converts ```mermaid blocks to raw HTML before Expressive Code sees them,
// so the client-side mermaid renderer can find them via pre code.language-mermaid.
export function remarkMermaid() {
  return (tree) => {
    function walk(node, parent, index) {
      if (node.type === "code" && node.lang === "mermaid" && parent) {
        const escaped = node.value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        parent.children[index] = {
          type: "html",
          value: `<pre><code class="language-mermaid">${escaped}</code></pre>`,
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
