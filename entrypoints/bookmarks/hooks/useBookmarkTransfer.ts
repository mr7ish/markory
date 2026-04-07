import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { message } from "@/components/tiny-message";
import {
  createBookmarkTransferData,
  importBookmarkTransferData,
  parseBookmarkTransferData,
  type BookmarkTransferData,
} from "@/bookmarks/api/import-export";
import { useGroupStore } from "@/bookmarks/store/group";
import { useImportStore } from "@/bookmarks/store/import";
import { useRecycleStore } from "@/bookmarks/store/recycle";

export function useBookmarkTransfer() {
  const { t } = useI18n();

  const groupStore = useGroupStore();
  const { setGroupNodeIds } = groupStore;
  const { groupNodeIds, isGroupNodesFinished } = storeToRefs(groupStore);

  const importStore = useImportStore();
  const { setImportNodeIds } = importStore;
  const { importNodeIds, isImportNodesFinished } = storeToRefs(importStore);

  const recycleStore = useRecycleStore();
  const { setRecycleNodes } = recycleStore;
  const { recycleNodes, isRecycleNodesFinished } = storeToRefs(recycleStore);

  const {
    data: focusNodes,
    set: setFocusNodes,
    isFinished: isFocusNodesFinished,
  } = useIDBKeyval<Browser.bookmarks.BookmarkTreeNode[]>("focus-nodes", [], {
    shallow: true,
  });

  const importInputRef = useTemplateRef<HTMLInputElement>("importInputRef");
  const importConfirmVisible = ref(false);
  const pendingImportData = shallowRef<BookmarkTransferData>();
  const isImporting = ref(false);
  const isExporting = ref(false);

  const isTransferReady = computed(
    () =>
      isFocusNodesFinished.value &&
      isGroupNodesFinished.value &&
      isImportNodesFinished.value &&
      isRecycleNodesFinished.value,
  );

  const isTransferDisabled = computed(
    () => !isTransferReady.value || isImporting.value || isExporting.value,
  );

  function ensureTransferReady() {
    if (isTransferDisabled.value && !isTransferReady.value) {
      message.warning(t("importExportLoadingTips"));
      return false;
    }

    return !isImporting.value && !isExporting.value;
  }

  function triggerImport() {
    if (!ensureTransferReady()) return;
    importInputRef.value?.click();
  }

  async function handleExport() {
    if (!ensureTransferReady()) return;

    isExporting.value = true;

    try {
      const { groupIds = [] } = await browser.storage.local.get<{ groupIds: string[] }>("groupIds");

      const data = await createBookmarkTransferData({
        focusNodeIds: focusNodes.value.map((node) => node.id),
        groupNodeIds: [...groupNodeIds.value, ...groupIds],
        importNodeIds: importNodeIds.value,
        recycleNodes: recycleNodes.value.map((item) => ({
          nodeId: item.node.id,
          timestamp: item.timestamp,
        })),
      });

      downloadTransferFile(JSON.stringify(data, null, 2));
      message.success(t("exportSuccessTips"));
    } catch (error) {
      console.error(error);
      message.error(t("exportFailedTips"));
    } finally {
      isExporting.value = false;
    }
  }

  async function handleImportFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    try {
      const raw = await file.text();
      pendingImportData.value = parseBookmarkTransferData(raw);
      importConfirmVisible.value = true;
    } catch (error) {
      console.error(error);
      clearPendingImport();
      message.error(t("importFileInvalidTips"));
    }
  }

  async function confirmImport() {
    if (!pendingImportData.value || isImporting.value) return;

    isImporting.value = true;

    try {
      const result = await importBookmarkTransferData(pendingImportData.value);

      setFocusNodes(mergeNodesById(focusNodes.value, result.focusNodes));
      setGroupNodeIds(mergeStringIds(groupNodeIds.value, result.groupNodeIds));
      setImportNodeIds(mergeStringIds(importNodeIds.value, result.importNodeIds));
      setRecycleNodes(mergeRecycleNodes(recycleNodes.value, result.recycleNodes));

      message.success(t("importSuccessTips"));
    } catch (error) {
      console.error(error);
      message.error(t("importFailedTips"));
    } finally {
      clearPendingImport();
      isImporting.value = false;
    }
  }

  function clearPendingImport() {
    pendingImportData.value = undefined;
  }

  return {
    importInputRef,
    importConfirmVisible,
    isTransferReady,
    isTransferDisabled,
    triggerImport,
    handleExport,
    handleImportFileChange,
    confirmImport,
    clearPendingImport,
  };
}

function mergeNodesById(
  currentNodes: Browser.bookmarks.BookmarkTreeNode[],
  importedNodes: Browser.bookmarks.BookmarkTreeNode[],
) {
  const mapping = new Map<string, Browser.bookmarks.BookmarkTreeNode>();

  currentNodes.forEach((node) => {
    mapping.set(node.id, node);
  });

  importedNodes.forEach((node) => {
    mapping.set(node.id, node);
  });

  return [...mapping.values()];
}

function mergeStringIds(currentIds: string[], importedIds: string[]) {
  return [...new Set([...currentIds, ...importedIds])];
}

function mergeRecycleNodes(
  currentNodes: {
    timestamp: number;
    node: Browser.bookmarks.BookmarkTreeNode;
  }[],
  importedNodes: {
    timestamp: number;
    node: Browser.bookmarks.BookmarkTreeNode;
  }[],
) {
  const mapping = new Map<
    string,
    {
      timestamp: number;
      node: Browser.bookmarks.BookmarkTreeNode;
    }
  >();

  currentNodes.forEach((item) => {
    mapping.set(item.node.id, item);
  });

  importedNodes.forEach((item) => {
    mapping.set(item.node.id, item);
  });

  return [...mapping.values()];
}

function downloadTransferFile(content: string) {
  const blob = new Blob([content], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  link.href = url;
  link.download = `markory-bookmarks-${timestamp}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
