<template>
  <div class="tree-node">
    <div
      class="node-header"
      :class="{
        selected: selectedNodeId === node.id,
        disabled,
      }"
      @click="selectNode(node)"
    >
      <div
        class="icon-placeholder"
        @click.stop="handleToggle"
      >
        <IconTag
          v-if="folderChildren.length > 0"
          icon="akar-icons:triangle-down-fill"
          width="12"
          class="toggle-icon"
          :class="{ expanded }"
        />
      </div>
      <IconTag
        icon="basil:folder-open-solid"
        width="20"
      />
      <IconTag
        v-if="selectedNodeId === node.id"
        icon="mynaui:check-solid"
        width="20"
        class="check-icon"
      />

      <span
        class="node-title"
        :title="node.title"
      >
        {{ node.title || "未命名文件夹" }}
      </span>
    </div>

    <div
      v-if="folderChildren.length > 0 && expanded"
      class="node-children"
    >
      <TreeNode
        v-for="child in folderChildren"
        :key="child.id"
        :node="child"
        :expanded-nodes="expandedNodes"
        :selected-node-id="selectedNodeId"
        :context-node-id="contextNodeId"
        :disabled="disabled || contextNodeId === child.id"
        @toggle="emit('toggle', $event)"
        @select="selectNode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import { computed } from "vue";

interface Props {
  node: Browser.bookmarks.BookmarkTreeNode;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  contextNodeId?: string;
  maxHeight?: number;
  disabled?: boolean;
}

interface Emits {
  (e: "toggle", nodeId: string): void;
  (e: "select", node: Browser.bookmarks.BookmarkTreeNode): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const folderChildren = computed(() => {
  return props.node.children?.filter((child) => !child.url) || [];
});

const expanded = computed(() => {
  return props.expandedNodes.has(props.node.id);
});

function handleToggle() {
  if (folderChildren.value.length > 0) {
    emit("toggle", props.node.id);
  }
}

function selectNode(node: Browser.bookmarks.BookmarkTreeNode) {
  if (props.disabled) return;
  if (node.id === props.selectedNodeId) return;
  emit("select", node);
}
</script>

<style scoped lang="less">
.tree-node {
  .node-header {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    position: relative;

    &:hover {
      background-color: var(--tree-node-hover-bg);
    }

    &.selected {
      background-color: var(--tree-node-hover-bg);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .icon-placeholder {
      margin-right: 4px;
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-icon {
      transform: rotate(-90deg);
      transition: transform 0.2s;

      &.expanded {
        transform: rotate(0deg);
      }
    }

    .check-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }

    &.selected {
      .check-icon {
        opacity: 1;
      }
    }

    .node-title {
      margin-left: 6px;
      font-size: 14px;
      color: var(--text);
      line-height: 20px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .node-children {
    padding-left: 40px;
  }
}
</style>
