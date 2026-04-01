// Adds class="expandable" to every <img> processed from markdown.
// The MarkdownPostLayout client script uses this class to attach the expand/lightbox button.
export function rehypeExpandableImages() {
  return (tree) => {
    function walk(node) {
      if (node.type === "element" && node.tagName === "img") {
        node.properties = node.properties || {};
        const existing = node.properties.className;
        if (Array.isArray(existing)) {
          existing.push("expandable");
        } else if (existing) {
          node.properties.className = [existing, "expandable"];
        } else {
          node.properties.className = ["expandable"];
        }
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    }
    walk(tree);
  };
}
