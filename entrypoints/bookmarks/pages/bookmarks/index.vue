<template>
  <div class="bookmark-layout-wrapper">
    <BreadCrumb />
    <div class="bookmark-content-wrapper">
      <DisplayPage
        :nodes="showNodes"
        :module="activeMenu"
        :focus-node-ids="focusNodeIds"
        @focus="focus"
        @recycle="recycle"
      />
    </div>
    <MenuIsland v-model:activeMenu="activeMenu" />
  </div>
</template>

<script setup lang="ts">
import { useBookmarkNodesQuery } from "@/bookmarks/queries/bookmarks";
import BreadCrumb from "./components/BreadCrumb.vue";
import DisplayPage from "./components/DisplayPage.vue";
import { watchNode } from "@/bookmarks/api/bookmarks";
import { useRoute } from "vue-router";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import MenuIsland from "./components/MenuIsland.vue";

const route = useRoute();
const activeMenu = ref("folder");

watch(
  () => route.query,
  (_route) => {
    console.log("_route => ", _route);
  },
  {
    immediate: true,
  },
);

const { nodes, fetchTopNodes, fetchChildrenNodes } = useBookmarkNodesQuery();

const { data: focusNodes, set: setFocusNodes } = useIDBKeyval<Browser.bookmarks.BookmarkTreeNode[]>(
  "focus-nodes",
  [],
  {
    shallow: true,
  },
);

const focusNodeIds = computed(() => focusNodes.value.map((i) => i.id));

const { data: recycleNodes, set: setRecycleNodes } = useIDBKeyval<
  Browser.bookmarks.BookmarkTreeNode[]
>("recycle-nodes", [], {
  shallow: true,
});

const showNodes = computed(() => {
  if (activeMenu.value === "folder") {
    return nodes.value.filter((i) => !recycleNodes.value.map((j) => j.id).includes(i.id));
  }

  if (activeMenu.value === "focus") {
    return focusNodes.value.filter((i) => !recycleNodes.value.map((j) => j.id).includes(i.id));
  }

  if (activeMenu.value === "recycle") {
    return recycleNodes.value;
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
  if (recycleNodes.value.map((i) => i.id).includes(node.id)) return;
  setRecycleNodes([...recycleNodes.value, node]);
}

watchEffect(() => {
  console.log("showNodes => ", showNodes.value);
});

watchNode((id: string) => {
  const queryId = route.query.id as string;

  if (queryId === "folder") {
    fetchTopNodes();
    return;
  }

  if (isNaN(Number(queryId))) return;

  fetchChildrenNodes(queryId);
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
