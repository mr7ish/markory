<template>
  <div
    ref="scrollContainer"
    class="node-page-wrapper"
    @contextmenu="openContextMenu($event, pageContextMenus)"
  >
    <div
      v-if="nodes.length > 0"
      class="nodes-wrapper"
    >
      <NodeItem
        v-for="node in displayedNodes"
        :key="node.id"
        :node="node"
        :is-dark-mode="isDarkMode"
        :is-system-icon="isSystemIcon(node.url)"
        :system-icon="systemIcon"
        :icon-list="getFaviconCandidates(node)"
        v-model:selected-favicon-mapping="selectedFaviconMapping"
        v-model:nodes-icon-mapping="nodesIconMapping"
        v-model:favicon-load-state="faviconLoadState"
        :is-focused="focusNodeIds.includes(node.id)"
        :disabled="module === 'recycle'"
        :drag-disabled="isDragDisabled"
        @contextmenu.stop.prevent="
          ($event: MouseEvent) => {
            contextNode = node;
            openContextMenu($event, nodeContextMenus);
          }
        "
      />
    </div>
    <EmptyWrapper v-else />

    <div
      v-if="!hasMore && displayedNodes.length > 0"
      class="no-more-hint"
    >
      <span>没有更多了~</span>
    </div>

    <ContextMenu
      v-model:visible="visible"
      :x="x"
      :y="y"
      :menus="menus"
      @select="contextMenuSelect"
    />

    <CreateModal
      v-model="createModalVisible"
      :isFolderNode="isFolderNode"
      :is-edit="isEdit"
      :node="contextNode"
      @confirm="getValues"
    />

    <TinyConfirm
      v-model="recycleConfirmVisible"
      title="放入回收站"
      content="10天内可在回收站中找回已删除文件。若不需要找回，请及时去回收站清理。"
      :maskClosable="false"
      confirm-text="确认放入"
      type="danger"
      @confirm="recycleConfirm"
      @cancel="contextNode = undefined"
    />

    <TinyConfirm
      v-model="deleteConfirmVisible"
      :title="`删除${isFolderNode ? '文件夹' : '书签'}`"
      content="确认删除吗？！删除后将无法恢复。"
      :maskClosable="false"
      confirm-text="确认删除"
      type="danger"
      @confirm="deleteConfirm"
      @cancel="contextNode = undefined"
    />

    <TinyConfirm
      v-model="clearConfirmVisible"
      title="清空回收站"
      content="确认清空回收站吗？！清空后将无法恢复。"
      :maskClosable="false"
      confirm-text="确认清空"
      type="danger"
      @confirm="clearConfirm"
    />

    <HeartBeat ref="heartBeatRef" />
  </div>
</template>

<script setup lang="ts">
import { generateFavicons } from "@/utils";
import EmptyWrapper from "@/components/EmptyWrapper.vue";
import { useRoute, useRouter } from "vue-router";
import ContextMenu from "@/components/context-menu/index.vue";
import { useContextMenu } from "@/components/context-menu/hooks/useContextMenu";
import { ContextMenuItem } from "@/components/context-menu";
import CreateModal, { FormValues } from "./CreateModal.vue";
import { useDarkMode } from "@/bookmarks/hooks/useDarkMode";
import { useInfiniteScrollNodes } from "@/bookmarks/hooks/useInfiniteScrollNodes";
import blackLogo from "@/assets/logo-black.svg";
import whiteLogo from "@/assets/logo-white.svg";
import { createNode, editNode, removeNode } from "@/bookmarks/api/bookmarks";
import { message } from "@/components/tiny-message";
import NodeItem from "./NodeItem.vue";
import HeartBeat from "@/components/HeartBeat.vue";
import TinyConfirm from "@/components/TinyConfirm.vue";

const {
  nodes = [],
  module = "folder",
  focusNodeIds = [],
  recycleNodeIds = [],
} = defineProps<{
  nodes?: Browser.bookmarks.BookmarkTreeNode[];
  module?: string;
  focusNodeIds?: string[];
  recycleNodeIds?: string[];
}>();

const emits = defineEmits<{
  focus: [node: Browser.bookmarks.BookmarkTreeNode];
  recycle: [node: Browser.bookmarks.BookmarkTreeNode];
}>();

const heartBeatRef = useTemplateRef("heartBeatRef");

const recycleConfirmVisible = ref(false);
const deleteConfirmVisible = ref(false);
const clearConfirmVisible = ref(false);

// 拖拽禁用判断（focus 和 recycle 模块下禁用拖拽）
const isDragDisabled = computed(() => ['recycle', 'focus'].includes(module));

// 无限滚动
const scrollContainer = useTemplateRef("scrollContainer");
const { displayedItems: displayedNodes, hasMore } = useInfiniteScrollNodes(
  scrollContainer,
  () => nodes,
);

async function clearConfirm() {
  if (recycleNodeIds.length === 0) return;
  await Promise.all(recycleNodeIds.map((i) => removeNode(i)));
  message.success("清空成功");
  clearConfirmVisible.value = false;
}

async function deleteConfirm() {
  if (!contextNode.value) return;
  const success = await removeNode(contextNode.value.id);
  if (success) {
    message.success("删除成功");
    contextNode.value = undefined;
  }
}

function recycleConfirm() {
  if (!contextNode.value) return;
  emits("recycle", contextNode.value);
  message.info("已放入回收站，请及时清理");
}

watchEffect(() => {
  console.log("focusNodeIds => ", focusNodeIds);
});

const { isDarkMode } = useDarkMode();

const router = useRouter();
const route = useRoute();

const systemIcon = computed(() => (isDarkMode.value ? whiteLogo : blackLogo));

const createModalVisible = ref(false);
const isFolderNode = ref(true);
const isEdit = ref(false);

const { x, y, visible, menus, openContextMenu } = useContextMenu();

const contextNode = shallowRef<Browser.bookmarks.BookmarkTreeNode>();
const isContextNodeFocused = computed(() => {
  if (!contextNode.value) return false;
  return focusNodeIds.includes(contextNode.value.id);
});

const pageContextMenus = computed<ContextMenuItem[]>(() => {
  if (module === "folder") {
    return [
      { label: "新建文件夹", value: "create" },
      { label: "新建书签", value: "create" },
    ];
  }

  if (module === "recycle") {
    return [{ label: "清空回收站", value: "clear", danger: true }];
  }

  return [];
});

const nodeContextMenus = computed<ContextMenuItem[]>(() => {
  if (["folder", "focus"].includes(module)) {
    return [
      { label: "打开", value: "open" },
      { label: `${!isContextNodeFocused.value ? "" : "取消"}特别关注`, value: "focus" },
      { label: "编辑", value: "edit" },
      { label: "分隔线", value: "divided", divided: true },
      { label: "放入回收站", value: "recycle", danger: true },
    ];
  }

  if (module === "recycle") {
    return [
      { label: "放回", value: "recycle" },
      { label: "删除", value: "delete", danger: true },
    ];
  }

  return [];
});

const contextMenuTask = {
  create: (item: ContextMenuItem) => {
    isFolderNode.value = item.label === "新建文件夹";
    isEdit.value = false;
    createModalVisible.value = true;
  },
  open: () => {
    if (!contextNode.value) return;
    if (!contextNode.value.url) {
      router.push({
        name: "bookmarks",
        query: {
          id: contextNode.value.id,
          title: contextNode.value.title,
        },
      });
      return;
    }

    browser.tabs.create({ url: contextNode.value.url });
  },
  edit: () => {
    if (!contextNode.value) return;
    isFolderNode.value = !contextNode.value.url;
    isEdit.value = true;
    createModalVisible.value = true;
  },
  focus: () => {
    if (!contextNode.value) return;
    if (!isContextNodeFocused.value) {
      heartBeatRef.value?.play({
        x: x.value,
        y: y.value,
      });
    }
    emits("focus", contextNode.value);
  },
  recycle: () => {
    if (!contextNode.value) return;
    if (!recycleNodeIds.includes(contextNode.value.id)) {
      recycleConfirmVisible.value = true;
      return;
    }
    emits("recycle", contextNode.value);
  },
  delete: () => {
    if (!contextNode.value) return;
    isFolderNode.value = !contextNode.value.url;
    deleteConfirmVisible.value = true;
  },
  clear: () => {
    if (recycleNodeIds.length === 0) {
      message.warning("回收站为空");
      return;
    }
    clearConfirmVisible.value = true;
  },
};

function contextMenuSelect(item: ContextMenuItem) {
  // console.log("contextMenuSelect =>", item);
  contextMenuTask[item.value as keyof typeof contextMenuTask]?.(item);
}

function isSystemIcon(url?: string) {
  if (!url) return false;
  return ["chrome://bookmarks/"].includes(url);
}

async function getValues(values: FormValues) {
  console.log("getValues", values);
  const { folderName, bookmarkName, bookmarkUrl } = values;

  if (!isEdit.value) {
    const parentId = route.query.id === "folder" ? undefined : (route.query.id as string);

    const node = await createNode({
      title: !bookmarkUrl ? folderName : bookmarkName,
      url: bookmarkUrl,
      parentId,
    });

    if (!node) return;

    message.success("创建成功");
  } else {
    if (!contextNode.value) return;

    const node = await editNode({
      id: contextNode.value.id,
      changes: {
        title: !bookmarkUrl ? folderName : bookmarkName,
        url: bookmarkUrl,
      },
    });

    if (!node) return;

    message.success("编辑成功");
  }

  createModalVisible.value = false;
}

const nodesIconMapping = ref<Record<string, boolean>>({});
const faviconCandidatesMapping = ref<Record<string, string[]>>({});
const selectedFaviconMapping = ref<Record<string, string>>({});
const faviconLoadState = ref<
  Record<
    string,
    {
      loaded: boolean;
      remaining: number;
    }
  >
>({});

watch(
  () => nodes,
  (_nodes) => {
    const bookmarkNodes = _nodes.filter((node) => node.url && !isSystemIcon(node.url));

    const mapping: Record<string, boolean> = {};
    const candidatesMapping: Record<string, string[]> = {};
    const selectedMapping: Record<string, string> = {};
    const loadStateMapping: Record<
      string,
      {
        loaded: boolean;
        remaining: number;
      }
    > = {};

    bookmarkNodes.forEach((node) => {
      const candidates = generateFavicons(node.url!);
      candidatesMapping[node.id] = candidates;

      // 仅当旧 selected 仍在新候选列表里，才保留；否则视为“URL/候选已变化”，需要重新加载
      const prevSelected = selectedFaviconMapping.value[node.id];
      const hasValidSelected = !!prevSelected && candidates.includes(prevSelected);

      if (hasValidSelected) {
        selectedMapping[node.id] = prevSelected!;
        mapping[node.id] = false;
        loadStateMapping[node.id] = { loaded: true, remaining: 0 };
      } else {
        mapping[node.id] = true;
        loadStateMapping[node.id] = { loaded: false, remaining: candidates.length };
      }
    });

    nodesIconMapping.value = mapping;
    faviconCandidatesMapping.value = candidatesMapping;
    selectedFaviconMapping.value = selectedMapping;
    faviconLoadState.value = loadStateMapping;
  },
);

function getFaviconCandidates(node: Browser.bookmarks.BookmarkTreeNode) {
  return faviconCandidatesMapping.value[node.id] ?? generateFavicons(node.url ?? "");
}

async function loadBookmarks() {
  // const get = await browser.bookmarks.get(["5", "6"]);
  // console.log("get", get);

  // browser.bookmarks.move

  return;

  // 获取整个书签树
  const tree = await browser.bookmarks.getTree();
  console.log("tree", tree);

  const subtree = await browser.bookmarks.getSubTree("1");
  console.log("subtree", subtree);

  // 获取特定文件夹的子项
  const children = await browser.bookmarks.getChildren("1"); // 一般 "1" 是书签栏
  console.log(children);

  // 获取最近新加的书签
  const bookmarks = await browser.bookmarks.getRecent(10);
  console.log(bookmarks);

  // 监听书签变化
  browser.bookmarks.onChanged.addListener((id, changeInfo) => {
    console.log("Bookmark changed:", id, changeInfo);
  });
}

loadBookmarks();
</script>

<style scoped lang="less">
::-webkit-scrollbar {
  width: 8px;
  height: 6px;
  background-color: transparent;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 5px;
}
.node-page-wrapper {
  height: 100%;
  overflow-y: auto;

  .nodes-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); // 根据宽度自动适应列数
    gap: 50px;
    row-gap: 30px;
  }

  .no-more-hint {
    margin-top: 60px;
    text-align: center;
    color: #999;
    font-size: 12px;
    user-select: none;

    span {
      display: inline-block;
    }
  }
}
</style>
