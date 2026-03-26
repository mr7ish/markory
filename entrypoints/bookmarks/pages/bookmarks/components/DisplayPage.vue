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
      <URLPreview
        ref="urlPreviewRef"
        :url="previewURL"
        :left="previewX"
        :top="previewY"
      />
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
        :disabled="activeMenu === 'recycle'"
        :drag-disabled="isDragDisabled"
        @contextmenu.stop.prevent="
          ($event: MouseEvent) => {
            contextNode = node;
            openContextMenu($event, nodeContextMenus);
          }
        "
        :enable-preview="enablePreview"
        @enter="mouseEnterNode"
        @leave="mouseLeaveNode"
      />
    </div>
    <EmptyWrapper v-else />

    <div
      v-if="!hasMore && displayedNodes.length > 0"
      class="no-more-hint"
    >
      <span>{{ t("noMoreTips") }}</span>
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
      :is-group="isGroup"
      :node="contextNode"
      @confirm="getValues"
    />

    <TinyConfirm
      v-model="recycleConfirmVisible"
      :title="t('recycleModalTitle')"
      :content="t('recycleModalContent')"
      :maskClosable="false"
      :confirm-text="t('recycleModalConfirmText')"
      :cancel-text="t('defaultCancelText')"
      type="danger"
      @confirm="recycleConfirm"
      @cancel="contextNode = undefined"
    />

    <TinyConfirm
      v-model="deleteConfirmVisible"
      :title="`${t('deleteText')}${t(isFolderNode ? 'folderText' : 'bookmarkText')}`"
      :content="t('deleteModalContent')"
      :maskClosable="false"
      :confirm-text="t('deleteModalConfirmText')"
      :cancel-text="t('defaultCancelText')"
      type="danger"
      @confirm="deleteConfirm"
      @cancel="contextNode = undefined"
    />

    <TinyConfirm
      v-model="clearConfirmVisible"
      :title="t('clearModalTitle')"
      :content="t('clearModalContent')"
      :maskClosable="false"
      :confirm-text="t('clearModalConfirmText')"
      :cancel-text="t('defaultCancelText')"
      type="danger"
      @confirm="clearConfirm"
    />

    <TinyModal
      v-model="treeVisible"
      width="420px"
      :closeOnMask="false"
      destroyOnClose
    >
      <template #header> {{ t("moveModalTitle") }} </template>
      <div class="tree-modal-content">
        <BookmarkTree
          v-model:selected-node="selectedNode"
          :route-ids="routeIds"
          :context-node-id="contextNode?.id || ''"
        />
      </div>
      <div class="tree-footer-wrapper">
        <TinyButton
          type="secondary"
          @click="treeModalCancel"
        >
          {{ t("modalCancelText") }}
        </TinyButton>
        <TinyButton @click="debounceTreeModalConfirm"> {{ t("moveModalConfirmText") }} </TinyButton>
      </div>
    </TinyModal>

    <HeartBeat ref="heartBeatRef" />
  </div>
</template>

<script setup lang="ts">
import { generateFavicons } from "@/utils";
import EmptyWrapper from "@/components/EmptyWrapper.vue";
import ContextMenu from "@/components/context-menu/index.vue";
import { useContextMenu } from "@/components/context-menu/hooks/useContextMenu";
import { ContextMenuItem } from "@/components/context-menu";
import CreateModal, { FormValues } from "./CreateModal.vue";
import { useDarkMode } from "@/bookmarks/hooks/useDarkMode";
import { useInfiniteScrollNodes } from "@/bookmarks/hooks/useInfiniteScrollNodes";
import blackLogo from "@/assets/logo-black.svg";
import whiteLogo from "@/assets/logo-white.svg";
import {
  createNode,
  editNode,
  fetchNodeChildrenById,
  groupTabs,
  moveNode,
  openGroupedTabs,
  removeNode,
} from "@/bookmarks/api/bookmarks";
import { message } from "@/components/tiny-message";
import NodeItem from "./NodeItem.vue";
import HeartBeat from "@/components/HeartBeat.vue";
import TinyConfirm from "@/components/TinyConfirm.vue";
import TinyModal from "@/components/TinyModal.vue";
import BookmarkTree from "./BookmarkTree.vue";
import TinyButton from "@/components/TinyButton.vue";
import { useRoutesStore } from "@/bookmarks/store/routes";
import { storeToRefs } from "pinia";
import { useRecycleStore } from "@/bookmarks/store/recycle";
import { useI18n } from "vue-i18n";
import URLPreview from "@/components/URLPreview.vue";
import { useSettingStore } from "@/bookmarks/store/setting";
import { useGroupStore } from "@/bookmarks/store/group";

const groupStore = useGroupStore();
const { setGroupNodeIds } = groupStore;
const { groupNodeIds } = storeToRefs(groupStore);

const { enablePreview } = useSettingStore();
const urlPreviewRef = useTemplateRef("urlPreviewRef");
const previewX = ref(0);
const previewY = ref(0);
const previewURL = ref("");

function mouseEnterNode(node: Browser.bookmarks.BookmarkTreeNode, x: number, y: number) {
  previewX.value = x;
  previewY.value = y;
  previewURL.value = node.url!;
  urlPreviewRef.value?.showPreview();
}

function mouseLeaveNode() {
  previewURL.value = "";
  urlPreviewRef.value?.hidePreview();
}

const { t, locale } = useI18n();

const {
  nodes = [],
  focusNodeIds = [],
  recycleNodeIds = [],
  routeIds = [],
} = defineProps<{
  nodes?: Browser.bookmarks.BookmarkTreeNode[];
  focusNodeIds?: string[];
  recycleNodeIds?: string[];
  routeIds?: string[];
}>();

const emits = defineEmits<{
  focus: [node: Browser.bookmarks.BookmarkTreeNode];
  recycle: [node: Browser.bookmarks.BookmarkTreeNode];
}>();

const routesStore = useRoutesStore();
const { setRoutes } = routesStore;
const { activeMenu, routes, queryId } = storeToRefs(routesStore);

const { getSubIds, setRemoveNodeIds } = useRecycleStore();

const heartBeatRef = useTemplateRef("heartBeatRef");

const recycleConfirmVisible = ref(false);
const deleteConfirmVisible = ref(false);
const clearConfirmVisible = ref(false);
const treeVisible = ref(false);

const selectedNode = shallowRef<Browser.bookmarks.BookmarkTreeNode>();
const debounceTreeModalConfirm = debounce(treeModalConfirm, 300);

function treeModalCancel() {
  treeVisible.value = false;
}

async function treeModalConfirm() {
  if (!contextNode.value || !selectedNode.value) return;
  if (selectedNode.value.id === contextNode.value.parentId) {
    treeVisible.value = false;
    return;
  }

  try {
    const success = await moveNode(contextNode.value.id, { parentId: selectedNode.value.id });
    if (success) {
      treeVisible.value = false;

      const targetName = selectedNode.value.id === "1" ? t("folder") : selectedNode.value.title;

      const tips =
        locale.value === "zh"
          ? `已移动"${contextNode.value.title}"到"${targetName}"`
          : `${contextNode.value.title} has been moved to ${targetName}`;
      message.success(tips);
    }
  } catch (error) {
    message.error(t("moveFailedTips"));
  }
}

// 拖拽禁用判断（focus 和 recycle 模块下禁用拖拽）
const isDragDisabled = computed(() => ["recycle", "focus", "group"].includes(activeMenu.value));

// 无限滚动
const scrollContainer = useTemplateRef("scrollContainer");
const { displayedItems: displayedNodes, hasMore } = useInfiniteScrollNodes(
  scrollContainer,
  () => nodes,
);

async function clearConfirm() {
  if (recycleNodeIds.length === 0) return;

  const removeIds = await getSubIds(recycleNodeIds);
  setRemoveNodeIds(removeIds);

  await Promise.all(recycleNodeIds.map((i) => removeNode(i)));
  message.success(t("clearSuccessTips"));
  clearConfirmVisible.value = false;
}

async function deleteConfirm() {
  if (!contextNode.value) return;

  const removeIds = await getSubIds([contextNode.value.id]);
  setRemoveNodeIds(removeIds);

  const success = await removeNode(contextNode.value.id);
  if (success) {
    message.success(t("deleteSuccessTips"));
    contextNode.value = undefined;
  }
}

function recycleConfirm() {
  if (!contextNode.value) return;
  emits("recycle", contextNode.value);
  message.info(t("recycleSuccessTips"));
}

watchEffect(() => {
  console.log("focusNodeIds => ", focusNodeIds);
});

const { isDarkMode } = useDarkMode();

const systemIcon = computed(() => (isDarkMode.value ? whiteLogo : blackLogo));

const createModalVisible = ref(false);
const isFolderNode = ref(true);
const isEdit = ref(false);
const isGroup = ref(false);

const { x, y, visible, menus, openContextMenu } = useContextMenu();

const contextNode = shallowRef<Browser.bookmarks.BookmarkTreeNode>();
const isContextNodeFocused = computed(() => {
  if (!contextNode.value) return false;
  return focusNodeIds.includes(contextNode.value.id);
});

const pageContextMenus = computed<ContextMenuItem[]>(() => {
  if (activeMenu.value === "folder") {
    return [
      { label: t("createFolderContext"), value: "create" },
      { label: t("createBookmarkContext"), value: "create" },
      { label: t("groupContext"), value: "group" },
    ];
  }

  if (activeMenu.value === "recycle") {
    return [{ label: t("clearContext"), value: "clear", danger: true }];
  }

  return [];
});

const nodeContextMenus = computed<ContextMenuItem[]>(() => {
  if (["folder", "focus"].includes(activeMenu.value)) {
    return [
      { label: t("openContext"), value: "open" },
      { label: t("openAllByGroupContext"), value: !contextNode.value?.url ? "openAllByGroup" : "" },
      {
        label: `${!isContextNodeFocused.value ? "" : t("defaultCancelText")}${t("focusContext")}`,
        value: "focus",
      },
      { label: t("editText"), value: "edit" },
      { label: t("moveContext"), value: "move" },
      { label: t("dividedContext"), value: "divided", divided: true },
      { label: t("recycleContext"), value: "recycle", danger: true },
    ].filter((i) => i.value);
  }

  if (activeMenu.value === "recycle") {
    return [
      { label: t("putBackContext"), value: "recycle" },
      { label: t("deleteContext"), value: "delete", danger: true },
    ];
  }

  return [];
});

const contextMenuTask = {
  create: (item: ContextMenuItem) => {
    isFolderNode.value = item.label === t("createFolderContext");
    isEdit.value = false;
    isGroup.value = false;
    createModalVisible.value = true;
  },
  group: () => {
    isFolderNode.value = true;
    isGroup.value = true;
    createModalVisible.value = true;
  },
  open: () => {
    if (!contextNode.value) return;
    if (!contextNode.value.url) {
      setRoutes([
        ...routes.value,
        {
          id: contextNode.value.id,
          title: contextNode.value.title,
        },
      ]);
      return;
    }

    browser.tabs.create({ url: contextNode.value.url });
  },
  edit: () => {
    if (!contextNode.value) return;
    isFolderNode.value = !contextNode.value.url;
    isEdit.value = true;
    isGroup.value = false;
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
      message.warning(t("recycleBinEmptyTips"));
      return;
    }
    clearConfirmVisible.value = true;
  },
  move: async () => {
    if (!contextNode.value) return;
    treeVisible.value = true;
    const [node] = await browser.bookmarks.get(contextNode.value.parentId!);
    selectedNode.value = node;
  },
  openAllByGroup: async () => {
    if (!contextNode.value) return;
    const nodes = (await fetchNodeChildrenById(contextNode.value.id)).filter((node) => node.url);

    openGroupedTabs(
      nodes.map((node) => node.url!),
      contextNode.value.title,
    );
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
    const parentId = queryId.value === "folder" ? undefined : queryId.value;

    const node = await createNode({
      title: !bookmarkUrl ? folderName : bookmarkName,
      url: bookmarkUrl,
      parentId,
    });

    if (!node) {
      message.error(t("createFailedTips"));
      return;
    }

    if (isGroup.value) {
      const groupId = await groupTabs(node.id);
      if (!groupId) return;
      setGroupNodeIds([...groupNodeIds.value, groupId]);
      createModalVisible.value = false;
      message.success(t("groupSuccessTips"));
      return;
    }

    message.success(t("createSuccessTips"));
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

    message.success(t("editSuccessTips"));
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
    position: relative;
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

.tree-modal-content {
  height: 250px;
  overflow: auto;
}

.tree-footer-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
