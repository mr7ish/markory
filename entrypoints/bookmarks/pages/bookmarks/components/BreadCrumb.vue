<template>
  <div class="bread-crumb-wrapper">
    <div
      v-for="(route, i) in routes"
      :key="route.id"
      class="crumb-item"
      :class="[
        routes.length === 1 ? 'cursor-default' : '',
        dragOverFolderId === route.id ? 'drag-over' : '',
        dragDisabledFolderId === route.id ? 'drag-disabled' : '',
      ]"
      :title="route.title"
      @click="jumpTo(route)"
      @dragenter="handleDragEnter(route.id, $event)"
      @dragover="handleDragOver(route.id, $event)"
      @dragleave="handleDragLeave($event)"
      @drop="handleDrop(route.id, $event)"
    >
      <div class="title text-overflow-hidden">{{ route.title }}</div>
      <IconTag
        v-if="i !== routes.length - 1"
        icon="ic:round-navigate-next"
        width="18"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import { message } from "@/components/tiny-message";
import { moveNode } from "@/bookmarks/api/bookmarks";
import { BreadCrumbRoute, useRoutesStore } from "@/bookmarks/store/routes";
import { storeToRefs } from "pinia";

const routesStore = useRoutesStore();
const { menus, setRoutes } = routesStore;
const { routes, queryId } = storeToRefs(routesStore);

const DRAG_DATA_KEY = "application/vnd.markory.bookmark-node";
const dragOverFolderId = ref<string | null>(null);
const dragDisabledFolderId = ref<string | null>(null);

// 检查是否启用拖拽（focus 和 recycle 模块下禁用）
const isDragEnabled = computed(() => {
  const currentId = queryId.value;
  return !["focus", "recycle"].includes(currentId);
});

// 拖拽状态（模块级别，用于跨组件共享）
const draggingNodeId = ref<string | null>(null);

// 监听来自 NodeItem 的拖拽事件
onMounted(() => {
  window.addEventListener("markory:dragstart", handleDragStart as EventListener);
  window.addEventListener("markory:dragend", handleDragEnd as EventListener);
});

onUnmounted(() => {
  window.removeEventListener("markory:dragstart", handleDragStart as EventListener);
  window.removeEventListener("markory:dragend", handleDragEnd as EventListener);
});

function handleDragStart(e: CustomEvent<{ nodeId: string }>) {
  draggingNodeId.value = e.detail.nodeId;
}

function handleDragEnd() {
  draggingNodeId.value = null;
  dragOverFolderId.value = null;
  dragDisabledFolderId.value = null;
}

/**
 * 检查文件夹是否禁止拖放
 */
function isDropDisabled(folderId: string, dragNodeId: string | null) {
  if (!dragNodeId) return false;

  // 禁止拖拽到自己
  if (dragNodeId === folderId) return true;

  // 禁止拖拽到当前文件夹
  const currentFolderId = queryId.value;
  if (folderId === currentFolderId) return true;

  // 根文件夹的特殊处理
  const isRootFolder = ["folder", "focus", "recycle"].includes(folderId);
  if (isRootFolder) {
    // 如果当前在根文件夹路径下，则禁止拖拽回根文件夹
    const isInRootPath =
      routes.value.length === 1 && ["folder", "focus", "recycle"].includes(routes.value[0]?.id);
    if (isInRootPath) return true;
  }

  return false;
}

/**
 * 获取实际的目标文件夹 ID（根文件夹统一为 "1"）
 */
function getTargetFolderId(folderId: string): string {
  // 如果是根文件夹，统一移动到书签栏（id="1"）
  if (["folder", "focus", "recycle"].includes(folderId)) {
    return "1";
  }
  return folderId;
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

function handleDragEnter(folderId: string, e: DragEvent) {
  e.preventDefault();

  // 检查是否启用拖拽
  if (!isDragEnabled.value) return;

  // 检查是否正在拖拽
  if (!draggingNodeId.value) return;

  // 检查是否禁止拖放
  if (isDropDisabled(folderId, draggingNodeId.value)) {
    dragDisabledFolderId.value = folderId;
    e.dataTransfer!.dropEffect = "none";
    return;
  }

  dragDisabledFolderId.value = null;
  dragOverFolderId.value = folderId;
  e.dataTransfer!.dropEffect = "move";
}

function handleDragOver(folderId: string, e: DragEvent) {
  e.preventDefault();

  // 检查是否启用拖拽
  if (!isDragEnabled.value) return;

  // 检查是否正在拖拽
  if (!draggingNodeId.value) return;

  // 检查是否禁止拖放
  if (isDropDisabled(folderId, draggingNodeId.value)) {
    dragDisabledFolderId.value = folderId;
    e.dataTransfer!.dropEffect = "none";
    return;
  }

  dragDisabledFolderId.value = null;
  dragOverFolderId.value = folderId;
  e.dataTransfer!.dropEffect = "move";
}

function handleDragLeave(e: DragEvent) {
  const target = e.currentTarget as HTMLElement;
  const relatedTarget = e.relatedTarget as HTMLElement;
  if (relatedTarget && target.contains(relatedTarget)) {
    return;
  }
  dragOverFolderId.value = null;
  dragDisabledFolderId.value = null;
}

async function handleDrop(folderId: string, e: DragEvent) {
  e.preventDefault();
  dragOverFolderId.value = null;
  dragDisabledFolderId.value = null;

  // 检查是否启用拖拽
  if (!isDragEnabled.value) return;

  // 从 dataTransfer 获取完整的拖拽数据（包含 nodeTitle）
  const dragData = getDragData(e);
  if (!dragData || !draggingNodeId.value) return;

  // 检查是否禁止拖放
  if (isDropDisabled(folderId, draggingNodeId.value)) {
    return;
  }

  // 获取实际的目标文件夹 ID（根文件夹统一为 "1"）
  const targetFolderId = getTargetFolderId(folderId);

  try {
    const success = await moveNode(dragData.nodeId, { parentId: targetFolderId });
    if (success) {
      // 获取目标文件夹名称
      const targetFolder = routes.value.find((r: BreadCrumbRoute) => r.id === folderId);
      const targetName = targetFolder?.title ?? "此文件夹";
      message.success(`已移动"${dragData.nodeTitle}"到"${targetName}"`);
    }
  } catch (error) {
    message.error("移动失败");
  }
}

function jumpTo(route: BreadCrumbRoute) {
  let _routes: BreadCrumbRoute[] = [];

  if (isNaN(Number(route.id))) {
    const target = menus.find((i) => i.id === route.id);

    _routes = !target
      ? []
      : [target].map((i) => ({
          id: i.id,
          title: i.title,
        }));
  }

  const index = routes.value.findIndex((i) => i.id === route.id);

  if (index !== -1) {
    _routes = routes.value.slice(0, index + 1);
  } else {
    _routes = [
      ...routes.value,
      {
        id: route.id,
        title: route.title,
      },
    ];
  }

  setRoutes(_routes);
}
</script>

<style scoped lang="less">
.bread-crumb-wrapper {
  display: flex;
  font-size: 16px;
  font-weight: bold;
  color: #888;

  .crumb-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    user-select: none;

    &.cursor-default {
      cursor: default;
    }

    &.drag-over {
      background-color: var(--menu-selected-bg, rgba(0, 122, 255, 0.1));
    }

    &.drag-disabled {
      background-color: rgba(255, 59, 48, 0.1);
      cursor: not-allowed;
    }

    .title {
      padding: 4px;
      transition: color 0.5s ease;
      max-width: 100px;

      &:hover {
        color: var(--text);
      }
    }

    &:last-child {
      .title {
        color: var(--text);
      }
    }
  }
}
</style>
