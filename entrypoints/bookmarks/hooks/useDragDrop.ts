export interface DragDropOptions {
  onDragStart?: (nodeId: string, event: DragEvent) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDrop?: (nodeId: string, targetFolderId: string) => void | Promise<void>;
}

export interface DragSource {
  nodeId: string;
  nodeTitle: string;
}

const DRAG_DATA_KEY = "application/vnd.markory.bookmark-node";

export function useDragDrop(options: DragDropOptions = {}) {
  const isDragging = ref(false);
  const draggedNodeId = ref<string | null>(null);

  /**
   * 为节点设置拖拽源
   */
  function makeDraggable(node: { id: string; title: string }) {
    return {
      draggable: true,
      onDragstart: (e: DragEvent) => {
        isDragging.value = true;
        draggedNodeId.value = node.id;

        // 设置传输数据
        const dragData: DragSource = {
          nodeId: node.id,
          nodeTitle: node.title,
        };
        e.dataTransfer?.setData(DRAG_DATA_KEY, JSON.stringify(dragData));

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
        }

        options.onDragStart?.(node.id, e);
      },
      onDragend: (e: DragEvent) => {
        isDragging.value = false;
        draggedNodeId.value = null;
        options.onDragEnd?.(e);
      },
    };
  }

  /**
   * 为文件夹设置放置目标
   */
  function makeDroppable(folderId: string) {
    const isDragOver = ref(false);

    return {
      onDragenter: (e: DragEvent) => {
        e.preventDefault();
        const dragData = getDragData(e);
        if (!dragData || dragData.nodeId === folderId) return;

        isDragOver.value = true;
        e.dataTransfer!.dropEffect = "move";
      },
      onDragover: (e: DragEvent) => {
        e.preventDefault();
        const dragData = getDragData(e);
        if (!dragData || dragData.nodeId === folderId) return;

        isDragOver.value = true;
        e.dataTransfer!.dropEffect = "move";
      },
      onDragleave: (e: DragEvent) => {
        // 只有当离开整个元素时才移除高亮
        const target = e.currentTarget as HTMLElement;
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (relatedTarget && target.contains(relatedTarget)) {
          return;
        }
        isDragOver.value = false;
      },
      onDrop: async (e: DragEvent) => {
        e.preventDefault();
        isDragOver.value = false;

        const dragData = getDragData(e);
        if (!dragData) return;

        // 不允许拖拽到自己或自己的父文件夹
        if (dragData.nodeId === folderId) return;

        await options.onDrop?.(dragData.nodeId, folderId);
      },
      isDragOver,
    };
  }

  /**
   * 从 DataTransfer 中获取拖拽数据
   */
  function getDragData(e: DragEvent): DragSource | null {
    try {
      const data = e.dataTransfer?.getData(DRAG_DATA_KEY);
      if (!data) return null;
      return JSON.parse(data) as DragSource;
    } catch {
      return null;
    }
  }

  return {
    isDragging,
    draggedNodeId,
    makeDraggable,
    makeDroppable,
    getDragData,
  };
}

export type UseDragDropReturn = ReturnType<typeof useDragDrop>;
