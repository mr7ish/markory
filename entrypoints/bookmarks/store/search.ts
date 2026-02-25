import { defineStore } from "pinia";

export const useSearchStore = defineStore("searchStore", () => {
  const tree = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);
  const idMap = computed(() => buildIdMap(tree.value));

  setTree();

  async function setTree() {
    const _tree = await browser.bookmarks.getTree();
    tree.value = _tree;
  }

  function buildIdMap(tree: Browser.bookmarks.BookmarkTreeNode[]) {
    const map = new Map<string, Browser.bookmarks.BookmarkTreeNode>();

    function traverse(nodes: Browser.bookmarks.BookmarkTreeNode[]) {
      for (const node of nodes) {
        map.set(node.id, node);
        if (node.children) {
          traverse(node.children);
        }
      }
    }

    traverse(tree);
    return map;
  }

  function findPathByMap(targetId: string) {
    const path = [];

    let current = idMap.value.get(targetId);

    while (current) {
      path.unshift(current);
      current = idMap.value.get(current.parentId || "");
    }

    return path.slice(2);
  }

  return {
    tree,
    setTree,
    findPathByMap,
  };
});
