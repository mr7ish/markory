import { defineStore } from "pinia";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

export const useRecycleStore = defineStore("recycleStore", () => {
  const {
    data: recycleNodes,
    set: setRecycleNodes,
    isFinished: isRecycleNodesFinished,
  } = useIDBKeyval<
    {
      timestamp: number;
      node: Browser.bookmarks.BookmarkTreeNode;
    }[]
  >("recycle-nodes", [], {
    shallow: true,
  });

  const recycleNodeIds = computed(() => recycleNodes.value.map((i) => i.node.id));

  // 包括回收节点及其所有子节点的 id
  const allRecycleNodeIds = shallowRef<string[]>([]);

  // 包括已经删除节点及其所有子节点的 id
  const allRemoveNodeIds = shallowRef<string[]>([]);

  watch(recycleNodes, async (_recycleNodes) => {
    console.log("recycleNodes => ", _recycleNodes);
    if (_recycleNodes.length === 0) {
      allRecycleNodeIds.value = [];
      return;
    }

    const subIds = await getSubIds(_recycleNodes.map((i) => i.node.id));
    console.log("subIds => ", subIds);

    allRecycleNodeIds.value = subIds;
  });

  function setRemoveNodeIds(ids: string[]) {
    allRemoveNodeIds.value = ids;
  }

  async function getSubIds(ids: string[]) {
    const subTreePromises = ids.map((i) => getSubTree(i));
    const subTrees = await Promise.all(subTreePromises);
    return getAllNodeIds(subTrees.flatMap((item) => item));
  }

  async function getSubTree(id: string) {
    const subTree = await browser.bookmarks.getSubTree(id);
    return subTree;
  }

  function getAllNodeIds(data: Browser.bookmarks.BookmarkTreeNode[]) {
    const result = [];
    const stack = [...data]; // 使用栈来模拟递归，避免调用栈溢出

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;

      result.push(node.id); // 获取当前节点的 id

      // 如果当前节点有子节点，加入栈中
      if (node.children && node.children.length > 0) {
        stack.push(...node.children);
      }
    }

    return result;
  }

  return {
    recycleNodes,
    recycleNodeIds,
    allRecycleNodeIds,
    setRecycleNodes,
    isRecycleNodesFinished,
    getSubIds,
    allRemoveNodeIds,
    setRemoveNodeIds,
  };
});
