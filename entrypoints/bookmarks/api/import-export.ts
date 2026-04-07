export interface BookmarkTransferNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkTransferNode[];
}

export interface BookmarkTransferRecycleNode {
  nodeId: string;
  timestamp: number;
}

export interface BookmarkTransferData {
  version: 1;
  exportedAt: string;
  roots: {
    bookmarksBar: BookmarkTransferNode[];
    otherBookmarks: BookmarkTransferNode[];
  };
  state: {
    focusNodeIds: string[];
    groupNodeIds: string[];
    importNodeIds?: string[];
    recycleNodes: BookmarkTransferRecycleNode[];
  };
}

export interface BookmarkTransferImportResult {
  focusNodes: Browser.bookmarks.BookmarkTreeNode[];
  groupNodeIds: string[];
  importNodeIds: string[];
  recycleNodes: {
    timestamp: number;
    node: Browser.bookmarks.BookmarkTreeNode;
  }[];
}

const TRANSFER_FILE_VERSION = 1 as const;
const ROOT_MAPPINGS = [
  {
    key: "bookmarksBar",
    rootId: "1",
  },
  {
    key: "otherBookmarks",
    rootId: "2",
  },
] as const;

export async function createBookmarkTransferData(params: {
  focusNodeIds: string[];
  groupNodeIds: string[];
  importNodeIds: string[];
  recycleNodes: BookmarkTransferRecycleNode[];
}): Promise<BookmarkTransferData> {
  const [bookmarksBar, otherBookmarks] = await Promise.all(
    ROOT_MAPPINGS.map(async ({ rootId }) => {
      try {
        const [rootNode] = await browser.bookmarks.getSubTree(rootId);
        return serializeTransferNodes(rootNode?.children ?? []);
      } catch {
        return [];
      }
    }),
  );

  return {
    version: TRANSFER_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    roots: {
      bookmarksBar,
      otherBookmarks,
    },
    state: {
      focusNodeIds: uniqueStrings(params.focusNodeIds),
      groupNodeIds: uniqueStrings(params.groupNodeIds),
      importNodeIds: uniqueStrings(params.importNodeIds),
      recycleNodes: uniqueRecycleNodes(params.recycleNodes),
    },
  };
}

export function parseBookmarkTransferData(raw: string): BookmarkTransferData {
  const parsed = JSON.parse(raw) as unknown;

  if (!isBookmarkTransferData(parsed)) {
    throw new Error("Invalid transfer file");
  }

  return parsed;
}

export async function importBookmarkTransferData(
  data: BookmarkTransferData,
): Promise<BookmarkTransferImportResult> {
  const nodeMap = new Map<string, Browser.bookmarks.BookmarkTreeNode>();

  for (const { key, rootId } of ROOT_MAPPINGS) {
    let startIndex = 0;

    try {
      const currentChildren = await browser.bookmarks.getChildren(rootId);
      startIndex = currentChildren.length;
    } catch {
      startIndex = 0;
    }

    await restoreTransferNodes(data.roots[key], rootId, nodeMap, startIndex);
  }

  const focusNodes = uniqueStrings(data.state.focusNodeIds)
    .map((oldId) => nodeMap.get(oldId))
    .filter((node): node is Browser.bookmarks.BookmarkTreeNode => !!node);

  const groupNodeIds = uniqueStrings(data.state.groupNodeIds)
    .map((oldId) => nodeMap.get(oldId)?.id)
    .filter((id): id is string => !!id);

  const recycleNodes = uniqueRecycleNodes(data.state.recycleNodes)
    .map((item) => {
      const node = nodeMap.get(item.nodeId);
      if (!node) return null;

      return {
        timestamp: item.timestamp,
        node,
      };
    })
    .filter(
      (
        item,
      ): item is {
        timestamp: number;
        node: Browser.bookmarks.BookmarkTreeNode;
      } => !!item,
    );

  return {
    focusNodes,
    groupNodeIds,
    importNodeIds: [...nodeMap.values()].map((node) => node.id),
    recycleNodes,
  };
}

function serializeTransferNodes(
  nodes: Browser.bookmarks.BookmarkTreeNode[],
): BookmarkTransferNode[] {
  return nodes.map((node) => ({
    id: node.id,
    title: node.title,
    ...(node.url ? { url: node.url } : {}),
    ...(node.children?.length
      ? {
          children: serializeTransferNodes(node.children),
        }
      : {}),
  }));
}

async function restoreTransferNodes(
  nodes: BookmarkTransferNode[],
  parentId: string,
  nodeMap: Map<string, Browser.bookmarks.BookmarkTreeNode>,
  startIndex = 0,
) {
  for (const [index, node] of nodes.entries()) {
    const createdNode = await browser.bookmarks.create({
      parentId,
      index: startIndex + index,
      title: node.title,
      ...(node.url ? { url: node.url } : {}),
    });

    nodeMap.set(node.id, createdNode);

    if (node.children?.length) {
      await restoreTransferNodes(node.children, createdNode.id, nodeMap);
    }
  }
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function uniqueRecycleNodes(values: BookmarkTransferRecycleNode[]) {
  const nodeMap = new Map<string, BookmarkTransferRecycleNode>();

  values.forEach((item) => {
    if (!item?.nodeId || typeof item.timestamp !== "number") return;
    nodeMap.set(item.nodeId, item);
  });

  return [...nodeMap.values()];
}

function isBookmarkTransferData(value: unknown): value is BookmarkTransferData {
  if (!isRecord(value)) return false;
  if (value.version !== TRANSFER_FILE_VERSION) return false;
  if (typeof value.exportedAt !== "string") return false;
  if (!isRecord(value.roots) || !isRecord(value.state)) return false;

  return (
    isTransferNodeList(value.roots.bookmarksBar) &&
    isTransferNodeList(value.roots.otherBookmarks) &&
    isStringList(value.state.focusNodeIds) &&
    isStringList(value.state.groupNodeIds) &&
    (!("importNodeIds" in value.state) || isStringList(value.state.importNodeIds)) &&
    isRecycleNodeList(value.state.recycleNodes)
  );
}

function isTransferNodeList(value: unknown): value is BookmarkTransferNode[] {
  return Array.isArray(value) && value.every((item) => isTransferNode(item));
}

function isTransferNode(value: unknown): value is BookmarkTransferNode {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.title !== "string") return false;
  if ("url" in value && value.url !== undefined && typeof value.url !== "string") return false;
  if ("children" in value && value.children !== undefined && !isTransferNodeList(value.children)) {
    return false;
  }

  return true;
}

function isRecycleNodeList(value: unknown): value is BookmarkTransferRecycleNode[] {
  return Array.isArray(value) && value.every((item) => isRecycleNode(item));
}

function isRecycleNode(value: unknown): value is BookmarkTransferRecycleNode {
  return (
    isRecord(value) &&
    typeof value.nodeId === "string" &&
    typeof value.timestamp === "number" &&
    Number.isFinite(value.timestamp)
  );
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
