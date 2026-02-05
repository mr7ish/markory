<template>
  <div class="bookmark-layout-wrapper">
    <BreadCrumb
      :routes="routes"
      :menus="menus"
      @set-routes="setRoutes"
    />
    <div class="bookmark-content-wrapper">
      <DisplayPage
        :nodes="showNodes"
        :module="activeMenu"
        :focus-node-ids="focusNodeIds"
        @focus="focus"
        @recycle="recycle"
      />
    </div>
    <MenuIsland
      :active-menu="activeMenu"
      :menus="menus"
      @change="setActiveMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { useBookmarkNodesQuery } from "@/bookmarks/queries/bookmarks";
import BreadCrumb, { BreadCrumbRoute } from "./components/BreadCrumb.vue";
import DisplayPage from "./components/DisplayPage.vue";
import { watchNode } from "@/bookmarks/api/bookmarks";
import { useRoute, useRouter } from "vue-router";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import MenuIsland from "./components/MenuIsland.vue";
import { watchOnce } from "@vueuse/core";

const router = useRouter();
const route = useRoute();

const menus = [
  {
    title: "全部文件夹",
    id: "folder",
    icon: "basil:folder-open-outline",
    activeIcon: "basil:folder-open-solid",
  },
  {
    title: "特别关注",
    id: "focus",
    icon: "si:heart-line",
    activeIcon: "si:heart-fill",
  },
  {
    title: "回收站",
    id: "recycle",
    icon: "basil:trash-outline",
    activeIcon: "basil:trash-solid",
    // icon: "flowbite:trash-bin-outline",
    // activeIcon: "flowbite:trash-bin-solid",
  },
];

const { data: activeMenu, set: setActiveMenu } = useIDBKeyval<string>("active-menu", menus[0].id);

const {
  data: routes,
  set: setRoutes,
  isFinished: isRoutesFinished,
} = useIDBKeyval<BreadCrumbRoute[]>("bread-crumb-routes", [], {
  shallow: true,
});

watchOnce(isRoutesFinished, (isFinished) => {
  if (!isFinished) return;

  if (routes.value.length > 1 || routes.value.length === 1) {
    const lastRoute = routes.value[routes.value.length - 1];
    router.replace({
      name: "bookmarks",
      query: {
        id: lastRoute.id,
        title: lastRoute.title,
        isInit: 1,
      },
    });

    return;
  }

  router.replace({
    name: "bookmarks",
    query: {
      id: menus[0].id,
      title: menus[0].title,
      isInit: 1,
    },
  });
});

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
  if (activeMenu.value === "folder" || !isNaN(Number(route.query.id))) {
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
