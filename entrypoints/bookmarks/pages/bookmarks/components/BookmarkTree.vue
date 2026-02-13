<template>
  <div class="bookmark-tree">
    <TreeNode
      v-for="node in treeNodes"
      :key="node.id"
      :node="node"
      :expanded-nodes="expandedNodes"
      :selected-node-id="selectedNode?.id"
      :context-node-id="contextNodeId"
      @toggle="toggleNode"
      @select="selectNode"
    />
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import TreeNode from "./TreeNode.vue";

const props = defineProps<{
  routeIds?: string[];
  contextNodeId?: string;
}>();

const treeNodes = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);
const expandedNodes = shallowRef<Set<string>>(new Set());
const selectedNode = defineModel<Browser.bookmarks.BookmarkTreeNode>("selectedNode");

initExpandedNodes();

async function initExpandedNodes() {
  if (!props.routeIds || props.routeIds.length === 0) return;
  expandedNodes.value = new Set(props.routeIds);
}

function selectNode(node: Browser.bookmarks.BookmarkTreeNode) {
  selectedNode.value = node;
}

function toggleNode(nodeId: string) {
  const newExpanded = new Set(expandedNodes.value);
  if (newExpanded.has(nodeId)) {
    newExpanded.delete(nodeId);
  } else {
    newExpanded.add(nodeId);
  }
  expandedNodes.value = newExpanded;
}

async function fetchTreeNodes() {
  const res = await browser.bookmarks.getTree();
  const rootNode = res[0].children!;
  const bookmarkNodes = rootNode[0].children!;
  const otherNodes = rootNode[1].children!;
  treeNodes.value = [...bookmarkNodes, ...otherNodes];
}

fetchTreeNodes();
</script>

<style scoped lang="less">
.bookmark-tree {
  padding: 8px 0;
}
</style>
