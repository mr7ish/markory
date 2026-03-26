import {
  fetchAllNodes,
  fetchNodeChildrenById,
  fetchSpecifiedNodes,
} from "@/entrypoints/bookmarks/api/bookmarks";
import { useRoutesStore } from "../store/routes";
import { storeToRefs } from "pinia";
import { useGroupStore } from "../store/group";

export function useBookmarkNodesQuery() {
  const nodes = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);

  const routesStore = useRoutesStore();
  const { routes } = storeToRefs(routesStore);

  const groupStore = useGroupStore();
  const { groupNodeIds, isGroupNodesFinished } = storeToRefs(groupStore);

  watch(
    [routes, isGroupNodesFinished],
    ([_routes, _isGroupNodesFinished]) => {
      console.log("useBookmarkNodesQuery => ", _routes);
      if (_routes.length === 0) return;

      const id = _routes[_routes.length - 1].id;

      if (id === "folder") {
        fetchTopNodes();
        return;
      }

      if (id === "group" && _isGroupNodesFinished) {
        fetchGroupNodes();
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
    if (!id) {
      nodes.value = [];
      return;
    }
    const _nodes = await fetchNodeChildrenById(id);
    console.log("_nodes => ", _nodes);
    nodes.value = _nodes;
  }

  async function fetchGroupNodes() {
    if (!groupNodeIds.value.length) {
      nodes.value = [];
      return;
    }

    const params: string[] = [];

    // 可能由于 vue 代理了原始数组，导致报错
    for (const id of groupNodeIds.value) {
      params.push(id);
    }

    const _nodes = await fetchSpecifiedNodes(params as [string, ...string[]]);
    nodes.value = _nodes;
  }

  return {
    nodes,
    fetchTopNodes,
    fetchChildrenNodes,
    fetchGroupNodes,
  };
}
