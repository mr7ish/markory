<template>
  <div
    :key="node.id"
    class="node-item-wrapper"
    :class="{
      'is-dragging': isDragging,
      'drag-over': isDragOver && !isDropDisabled,
      'drag-disabled': isDropDisabled,
    }"
    :draggable="!dragDisabled"
    @click="onNodeClick(node)"
    @dblclick="onNodeDblClick(node)"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <IconTag
      v-if="!node.url"
      icon="basil:folder-open-solid"
      width="50"
    />

    <div
      v-else
      class="icon-wrapper"
    >
      <template v-if="isSystemIcon">
        <img
          :src="systemIcon"
          class="icon"
        />
      </template>
      <template v-else>
        <picture v-show="!nodesIconMapping[node.id]">
          <source srcset="" />
          <img
            v-for="icon in iconList"
            :src="icon"
            :key="`icon-${node.id}-${icon}`"
            class="icon"
            :style="{
              display:
                selectedFaviconMapping[node.id] && selectedFaviconMapping[node.id] !== icon
                  ? 'none'
                  : undefined,
            }"
            :data-url="icon"
            @load="onIconLoad(node.id, icon)"
            @error="onIconError($event, node.id)"
          />
        </picture>
        <IconUndefined
          v-show="nodesIconMapping[node.id]"
          style="width: 32px; height: 32px"
          :is-dark="isDarkMode"
        />
      </template>
    </div>

    <div class="desc">
      <div
        class="title multi-line-webkit"
        :title="node.title"
      >
        {{ node.title }}
      </div>
      <div
        class="extra"
        v-if="node.dateGroupModified !== 0"
      >
        <span>
          {{ formatTimestamp(node.dateGroupModified, DateFormat.f6) }}
        </span>

        <IconTag
          v-if="heartVisible"
          icon="solar:heart-bold"
          width="12"
          color="#ff4d6a"
          class="icon-focus animate__animated"
          :class="{
            animate__bounceOut: isExiting,
            animate__heartBeat: isFocused,
          }"
          @animationend="onHeartAnimationEnd"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClickWithDbl } from "@/bookmarks/hooks/useClickWithDbl";
import IconTag from "@/components/IconTag.vue";
import { useRouter } from "vue-router";
import IconUndefined from "./IconUndefined.vue";
import { DateFormat, formatTimestamp } from "@/utils";
import { computed, ref, watch } from "vue";
import { moveNode } from "@/bookmarks/api/bookmarks";
import { message } from "@/components/tiny-message";

const props = defineProps<{
  node: Browser.bookmarks.BookmarkTreeNode;
  isDarkMode: boolean;
  isSystemIcon: boolean;
  systemIcon: string;
  iconList: string[];
  isFocused?: boolean;
  disabled?: boolean; // 点击禁用（回收站）
  dragDisabled?: boolean; // 拖拽禁用（特别关注 + 回收站）
}>();

const emits = defineEmits<{
  dragStart: [node: Browser.bookmarks.BookmarkTreeNode, event: DragEvent];
  dragEnd: [event: DragEvent];
}>();

const isExiting = ref(false);
const heartVisible = computed(() => !!props.isFocused || isExiting.value);

watch(
  () => props.isFocused,
  (focused, wasFocused) => {
    if (focused) {
      isExiting.value = false;
    } else if (wasFocused) {
      // 从聚焦变为未聚焦时保持图标挂载，先播完 bounceOut 再隐藏
      isExiting.value = true;
    }
  },
);

function onHeartAnimationEnd(evt: AnimationEvent) {
  if (isExiting.value && evt.animationName === "bounceOut") {
    isExiting.value = false;
  }
}

const router = useRouter();

const { onClick: onNodeClick, onDblClick: onNodeDblClick } =
  useClickWithDbl<Browser.bookmarks.BookmarkTreeNode>({
    onClick: (node) => {
      if (props.disabled) return;
      clickNode(node);
    },
    onDblClick: (node) => {
      if (props.disabled) return;
      dbClick(node);
    },
  });

const DRAG_DATA_KEY = "application/vnd.markory.bookmark-node";

// 拖放目标状态
const isDragging = ref(false);
const isDragOver = ref(false);
const isDropDisabled = ref(false);

// 当前正在拖拽的节点 ID（从全局事件获取）
const draggingNodeId = ref<string | null>(null);

// 监听全局拖拽事件
onMounted(() => {
  window.addEventListener("markory:dragstart", handleGlobalDragStart as EventListener);
  window.addEventListener("markory:dragend", handleGlobalDragEnd as EventListener);
});

onUnmounted(() => {
  window.removeEventListener("markory:dragstart", handleGlobalDragStart as EventListener);
  window.removeEventListener("markory:dragend", handleGlobalDragEnd as EventListener);
});

function handleGlobalDragStart(e: CustomEvent<{ nodeId: string }>) {
  draggingNodeId.value = e.detail.nodeId;
  isDragging.value = e.detail.nodeId === props.node.id;
}

function handleGlobalDragEnd() {
  draggingNodeId.value = null;
  isDragging.value = false;
  isDragOver.value = false;
  isDropDisabled.value = false;
}

// 判断当前节点是否是文件夹
const isFolder = computed(() => !props.node.url);

function handleDragStart(event: DragEvent) {
  if (props.disabled) {
    event.preventDefault();
    return;
  }

  const dragData = {
    nodeId: props.node.id,
    nodeTitle: props.node.title,
  };
  event.dataTransfer?.setData(DRAG_DATA_KEY, JSON.stringify(dragData));
  event.dataTransfer!.effectAllowed = "move";

  // 触发自定义事件，让 BreadCrumb 能够追踪拖拽状态
  window.dispatchEvent(
    new CustomEvent("markory:dragstart", {
      detail: { nodeId: props.node.id },
    }),
  );

  isDragging.value = true;
  emits("dragStart", props.node, event);
}

function handleDragEnd(event: DragEvent) {
  // 触发自定义事件，清除拖拽状态
  window.dispatchEvent(new CustomEvent("markory:dragend"));

  isDragging.value = false;
  isDragOver.value = false;
  isDropDisabled.value = false;
  emits("dragEnd", event);
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault();

  // 禁止拖拽到自己
  if (!draggingNodeId.value || draggingNodeId.value === props.node.id) {
    return;
  }

  // 只有文件夹可以作为拖放目标
  if (!isFolder.value) {
    isDropDisabled.value = true;
    event.dataTransfer!.dropEffect = "none";
    return;
  }

  isDropDisabled.value = false;
  isDragOver.value = true;
  event.dataTransfer!.dropEffect = "move";
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();

  // 禁止拖拽到自己
  if (!draggingNodeId.value || draggingNodeId.value === props.node.id) {
    return;
  }

  // 只有文件夹可以作为拖放目标
  if (!isFolder.value) {
    isDropDisabled.value = true;
    event.dataTransfer!.dropEffect = "none";
    return;
  }

  isDropDisabled.value = false;
  isDragOver.value = true;
  event.dataTransfer!.dropEffect = "move";
}

function handleDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (relatedTarget && target.contains(relatedTarget)) {
    return;
  }
  isDragOver.value = false;
  isDropDisabled.value = false;
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  isDropDisabled.value = false;

  // 禁止拖拽到自己或书签
  if (!draggingNodeId.value || draggingNodeId.value === props.node.id || !isFolder.value) {
    return;
  }

  // 获取拖拽数据
  const dragData = getDragData(event);
  if (!dragData) return;

  try {
    const success = await moveNode(dragData.nodeId, { parentId: props.node.id });
    if (success) {
      message.success(`已移动"${dragData.nodeTitle}"到"${props.node.title}"`);
      // 触发节点移动事件
      window.dispatchEvent(new CustomEvent("markory:nodemoved"));
    }
  } catch (error) {
    message.error("移动失败");
  }
}

function getDragData(e: DragEvent) {
  try {
    const data = e.dataTransfer?.getData(DRAG_DATA_KEY);
    if (!data) return null;
    return JSON.parse(data) as { nodeId: string; nodeTitle: string };
  } catch {
    return null;
  }
}

function clickNode(node: Browser.bookmarks.BookmarkTreeNode) {
  console.log("clickFolder", node);
}

function dbClick(node: Browser.bookmarks.BookmarkTreeNode) {
  if (!node.url) {
    router.push({
      name: "bookmarks",
      query: {
        id: node.id,
        title: node.title,
      },
    });
    return;
  }

  browser.tabs.create({ url: node.url });
}

const nodesIconMapping = defineModel<Record<string, boolean>>("nodesIconMapping", {
  default: () => ({}),
});

const selectedFaviconMapping = defineModel<Record<string, string>>("selectedFaviconMapping", {
  default: () => ({}),
});

const faviconLoadState = defineModel<Record<string, { loaded: boolean; remaining: number }>>(
  "faviconLoadState",
  {
    default: () => ({}),
  },
);

function isCurrentCandidateIcon(icon: string) {
  // iconList 可能会在一次渲染周期内更新：只接受“仍在当前候选列表里”的 load/error 事件
  return props.iconList.includes(icon);
}

watch(
  () => props.iconList,
  (next) => {
    const nodeId = props.node.id;

    // 候选列表更新后，若已锁定的 icon 不再存在，则清理锁定，避免把新候选全部隐藏
    const selected = selectedFaviconMapping.value[nodeId];
    if (selected && !next.includes(selected)) {
      delete selectedFaviconMapping.value[nodeId];
    }

    const state = faviconLoadState.value[nodeId];

    // 重新对齐本轮候选的计数/状态（仅当外部已初始化 state 时）
    if (state) {
      state.remaining = next.length;
      state.loaded = !!selectedFaviconMapping.value[nodeId];
    }

    // 有新候选时优先尝试渲染候选；没候选则显示 fallback
    nodesIconMapping.value[nodeId] = next.length === 0;
  },
);

function onIconLoad(nodeId: string, icon: string) {
  // 可能存在旧请求晚到：丢弃已不属于当前候选列表的 load
  if (!isCurrentCandidateIcon(icon)) return;

  const state = faviconLoadState.value[nodeId];
  if (state) state.loaded = true;

  // 多个候选都可能成功：只锁定第一个成功的 icon
  if (!selectedFaviconMapping.value[nodeId]) {
    selectedFaviconMapping.value[nodeId] = icon;
  }

  // 一旦有任意候选成功，就锁定成功状态，避免后续候选失败覆盖
  nodesIconMapping.value[nodeId] = false;
}

function onIconError(evt: Event, nodeId: string) {
  const img = evt?.target as HTMLImageElement | undefined;
  const icon = img?.dataset?.url;

  // 可能存在旧请求晚到：丢弃已不属于当前候选列表的 error，避免错误减少 remaining 或误触发 fallback
  if (icon && !isCurrentCandidateIcon(icon)) return;

  // 当前失败的候选直接隐藏，避免破裂图像留在界面
  if (img) img.style.display = "none";

  const state = faviconLoadState.value[nodeId];

  // 已经成功过就忽略后续 error，避免覆盖
  if (!state || state.loaded) return;

  state.remaining = Math.max(0, state.remaining - 1);

  // 只有当所有候选都失败时，才展示 fallback 图标
  if (state.remaining === 0) {
    nodesIconMapping.value[nodeId] = true;
  }
}
</script>

<style scoped lang="less">
.node-item-wrapper {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;

  &[draggable="true"] {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &.is-dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  &.drag-over {
    background-color: var(--drag-over-bg);
    border-radius: 8px;
  }

  &.drag-disabled {
    background-color: rgba(255, 59, 48, 0.1);
    border-radius: 8px;
    cursor: not-allowed;
  }

  .icon-focus {
    position: absolute;
    top: 0;
    right: -18px;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon {
      width: 32px;
      object-fit: cover;
    }
  }

  .desc {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;

    .title {
      font-size: 12px;
      line-height: 1.2;
      width: 100%;
      text-align: center;
    }

    .extra {
      height: 12px;
      font-size: 10px;
      color: #888;
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
    }
  }

  &:hover {
    background-color: var(--folder-hover-fill);
    border-radius: 8px;
  }
}
</style>
