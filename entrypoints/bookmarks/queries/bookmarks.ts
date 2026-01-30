import { fetchAllNodes, fetchNodeChildrenById } from "@/entrypoints/bookmarks/api/bookmarks";
import { useRoute } from "vue-router";

export function useBookmarkNodesQuery() {
  const route = useRoute();
  const nodes = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);

  watch(
    () => route.query.id,
    (id) => {
      if (!id) return;

      if (id === "folder") {
        fetchTopNodes();
        return;
      }

      if (isNaN(Number(id))) return;

      fetchChildrenNodes(id as string);
    },
    {
      immediate: true,
    },
  );

  async function fetchTopNodes() {
    const _nodes = await fetchAllNodes();
    nodes.value = _nodes;
  }

  async function fetchChildrenNodes(id: string) {
    const _nodes = await fetchNodeChildrenById(id);
    nodes.value = _nodes;
  }

  return {
    nodes,
    fetchTopNodes,
    fetchChildrenNodes,
  };
}
