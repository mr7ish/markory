<template>
  <div class="bookmark-layout-wrapper">
    <BreadCrumb />
    <div class="bookmark-content-wrapper">
      <DisplayPage
        :nodes="showNodes"
        :focus-node-ids="focusNodeIds"
        :recycle-node-ids="recycleNodeIds"
        :route-ids="routes.slice(1).map((i) => i.id)"
        @focus="focus"
        @recycle="recycle"
      />
    </div>
    <MenuIsland />
  </div>
</template>

<script setup lang="ts">
import { useBookmarkNodesQuery } from "@/bookmarks/queries/bookmarks";
import BreadCrumb from "./components/BreadCrumb.vue";
import DisplayPage from "./components/DisplayPage.vue";
import { removeNode, startWatchNode } from "@/bookmarks/api/bookmarks";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import MenuIsland from "./components/MenuIsland.vue";
import { watchOnce } from "@vueuse/core";
import { useSearchStore } from "@/bookmarks/store/search";
import { useRoutesStore } from "@/bookmarks/store/routes";
import { storeToRefs } from "pinia";
import { useRecycleStore } from "@/bookmarks/store/recycle";

const routesStore = useRoutesStore();
const { activeMenu, routes, queryId } = storeToRefs(routesStore);

const recycleStore = useRecycleStore();
const { setRecycleNodes, setRemoveNodeIds } = recycleStore;
const {
  recycleNodes,
  recycleNodeIds,
  allRecycleNodeIds,
  allRemoveNodeIds,
  isRecycleNodesFinished,
} = storeToRefs(recycleStore);

const searchStore = useSearchStore();
const { setTree } = searchStore;

const { nodes, fetchTopNodes, fetchChildrenNodes } = useBookmarkNodesQuery();

const { data: focusNodes, set: setFocusNodes } = useIDBKeyval<Browser.bookmarks.BookmarkTreeNode[]>(
  "focus-nodes",
  [],
  {
    shallow: true,
  },
);

const focusNodeIds = computed(() => focusNodes.value.map((i) => i.id));

watchOnce(isRecycleNodesFinished, removeExpiredRecycleNodes);

watch(activeMenu, (_activeMenu) => {
  if (_activeMenu === "recycle") {
    removeExpiredRecycleNodes();
  }
});

async function removeExpiredRecycleNodes() {
  const EXPIRY_DAYS = 10;
  const expiryTime = Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const expiredIds = recycleNodes.value
    .filter((i) => i.timestamp < expiryTime)
    .map((i) => i.node.id);
  if (expiredIds.length === 0) return;

  await Promise.all(expiredIds.map((i) => removeNode(i)));
}

const showNodes = computed(() => {
  if (activeMenu.value === "folder" || !isNaN(Number(queryId.value))) {
    return nodes.value.filter((i) => !recycleNodeIds.value.includes(i.id));
  }

  if (activeMenu.value === "focus") {
    return focusNodes.value.filter((i) => !allRecycleNodeIds.value.includes(i.id));
  }

  if (activeMenu.value === "recycle") {
    return recycleNodes.value.map((i) => i.node);
  }

  return nodes.value;
});

function focus(node: Browser.bookmarks.BookmarkTreeNode) {
  if (!focusNodeIds.value.includes(node.id)) {
    setFocusNodes([...focusNodes.value, node]);
    return;
  }

  setFocusNodes(focusNodes.value.filter((i) => i.id !== node.id));
}

function recycle(node: Browser.bookmarks.BookmarkTreeNode) {
  if (!recycleNodeIds.value.includes(node.id)) {
    setRecycleNodes([
      ...recycleNodes.value,
      {
        timestamp: Date.now(),
        node,
      },
    ]);
    return;
  }

  setRecycleNodes(recycleNodes.value.filter((i) => i.node.id !== node.id));
}

const pendingDeleteIds = ref<string[]>([]);
let deleteTimer: ReturnType<typeof setTimeout> | null = null;

async function flushPendingDeletes() {
  if (pendingDeleteIds.value.length > 0) {
    setRecycleNodes(recycleNodes.value.filter((i) => !allRecycleNodeIds.value.includes(i.node.id)));
    setFocusNodes(focusNodes.value.filter((i) => !allRemoveNodeIds.value.includes(i.id)));
    pendingDeleteIds.value = [];
    setRemoveNodeIds([]);
  }

  deleteTimer = null;
}

const stop = startWatchNode((id: string, { removeInfo }) => {
  console.log("watching Node => ", id);

  setTree();

  if (removeInfo) {
    pendingDeleteIds.value.push(id);

    if (deleteTimer) {
      clearTimeout(deleteTimer);
    }
    deleteTimer = setTimeout(flushPendingDeletes, 500);
  }

  if (queryId.value === "folder") {
    fetchTopNodes();
    return;
  }

  if (isNaN(Number(queryId.value))) return;

  fetchChildrenNodes(queryId.value);
});

onUnmounted(stop);
</script>

<style scoped lang="less">
.bookmark-layout-wrapper {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;

  .bookmark-content-wrapper {
    flex: 1;
    overflow: hidden;
  }
}
</style>
