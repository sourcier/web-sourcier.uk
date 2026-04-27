// Wraps every <table> in a <div class="table-wrap"> so the container can
// handle overflow scrolling and border-radius independently of the table itself.
// (border-radius is incompatible with border-collapse: collapse on <table>.)
export function rehypeWrapTables() {
  return (tree) => {
    function walk(node) {
      if (!node.children) return;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        if (child.type === "element" && child.tagName === "table") {
          node.children[i] = {
            type: "element",
            tagName: "div",
            properties: { className: ["table-wrap"] },
            children: [child],
          };
        } else {
          walk(child);
        }
      }
    }

    walk(tree);
  };
}
