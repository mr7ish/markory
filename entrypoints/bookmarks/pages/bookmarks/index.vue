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
import MenuIsland from "./components/MenuIsland.vue";
import { watchOnce } from "@vueuse/core";
import { useSearchStore } from "@/bookmarks/store/search";
import { useRoutesStore } from "@/bookmarks/store/routes";
import { storeToRefs } from "pinia";
import { useFocusStore } from "@/bookmarks/store/focus";
import { useRecycleStore } from "@/bookmarks/store/recycle";
import { useGroupStore } from "@/bookmarks/store/group";
import { useImportStore } from "@/bookmarks/store/import";

const focusStore = useFocusStore();
const { setFocusNodes } = focusStore;
const { focusNodes } = storeToRefs(focusStore);

const routesStore = useRoutesStore();
const { activeMenu, routes, queryId } = storeToRefs(routesStore);

const groupStore = useGroupStore();
const { setGroupNodeIds } = groupStore;
const { groupNodeIds } = storeToRefs(groupStore);

const importStore = useImportStore();
const { setImportNodeIds } = importStore;
const { importNodeIds } = storeToRefs(importStore);

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

const { nodes, fetchTopNodes, fetchChildrenNodes, fetchGroupNodes, fetchImportNodes } =
  useBookmarkNodesQuery();

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
  if (["folder", "group"].includes(activeMenu.value) || !isNaN(Number(queryId.value))) {
    return nodes.value.filter((i) => !recycleNodeIds.value.includes(i.id));
  }

  if (activeMenu.value === "focus") {
    return focusNodes.value.filter((i) => !allRecycleNodeIds.value.includes(i.id));
  }

  if (activeMenu.value === "import") {
    return nodes.value.filter((i) => !allRecycleNodeIds.value.includes(i.id));
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

let processTimer: ReturnType<typeof setTimeout> | null = null;

async function flushPendingDeletes() {
  if (pendingDeleteIds.value.length > 0) {
    // Only remove recycle-bin roots that were actually deleted in this batch.
    setRecycleNodes(recycleNodes.value.filter((i) => !pendingDeleteIds.value.includes(i.node.id)));
    setFocusNodes(focusNodes.value.filter((i) => !allRemoveNodeIds.value.includes(i.id)));
    setGroupNodeIds(groupNodeIds.value.filter((i) => !pendingDeleteIds.value.includes(i)));
    setImportNodeIds(importNodeIds.value.filter((i) => !allRemoveNodeIds.value.includes(i)));
    pendingDeleteIds.value = [];
    setRemoveNodeIds([]);
  }

  processTimer = null;
}

function otherProcess() {
  setTree();

  if (queryId.value === "folder") {
    fetchTopNodes();
    return;
  }

  if (queryId.value === "group") {
    fetchGroupNodes();
    return;
  }

  if (queryId.value === "import") {
    fetchImportNodes();
    return;
  }

  if (isNaN(Number(queryId.value))) return;

  fetchChildrenNodes(queryId.value);
}

const stop = startWatchNode((id: string, { removeInfo }) => {
  console.log("watching Node => ", id);

  if (processTimer) {
    clearTimeout(processTimer);
  }

  if (removeInfo) {
    pendingDeleteIds.value.push(id);

    processTimer = setTimeout(flushPendingDeletes, 500);
  } else {
    processTimer = setTimeout(otherProcess, 500);
  }
});

async function syncGroupIdsFromStorage() {
  if (document.visibilityState !== "visible") return;

  const { groupIds = [] } = await browser.storage.local.get<{ groupIds: string[] }>("groupIds");

  const filteredGroupIds = groupIds.filter((i) => !groupNodeIds.value.includes(i));
  // console.log("filteredGroupIds => ", filteredGroupIds);
  if (filteredGroupIds.length === 0) return;

  setGroupNodeIds([...groupNodeIds.value, ...filteredGroupIds]);

  browser.storage.local.set({
    groupIds: [],
  });

  if (queryId.value === "group") {
    fetchGroupNodes();
  }
}

onMounted(() => {
  document.addEventListener("visibilitychange", syncGroupIdsFromStorage);

  setTimeout(syncGroupIdsFromStorage, 1000);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", syncGroupIdsFromStorage);
  stop();
});
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
