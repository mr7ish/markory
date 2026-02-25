import { fetchAllNodes, fetchNodeChildrenById } from "@/entrypoints/bookmarks/api/bookmarks";
import { useRoutesStore } from "../store/routes";
import { storeToRefs } from "pinia";

export function useBookmarkNodesQuery() {
  const nodes = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);

  const routesStore = useRoutesStore();
  const { routes } = storeToRefs(routesStore);

  watch(
    routes,
    (_routes) => {
      console.log("useBookmarkNodesQuery => ", _routes);
      if (_routes.length === 0) return;

      const id = _routes[_routes.length - 1].id;

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
    if (!id) return;
    const _nodes = await fetchNodeChildrenById(id);
    console.log("_nodes => ", _nodes);
    nodes.value = _nodes;
  }

  return {
    nodes,
    fetchTopNodes,
    fetchChildrenNodes,
  };
}
