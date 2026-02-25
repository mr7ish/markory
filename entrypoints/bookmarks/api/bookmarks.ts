import { message } from "@/components/tiny-message";

/**
 * 获取书签栏和其他书签下的所有一级文件夹和书签
 */
export async function fetchAllNodes() {
  const res = await Promise.allSettled([
    browser.bookmarks.getChildren("1"),
    browser.bookmarks.getChildren("2"),
  ]);

  const nodes = res.map((i) => (i.status === "fulfilled" ? i.value : [])).flat();
  return nodes;
}

/**
 * 获取指定节点的子项
 */
export async function fetchNodeChildrenById(id: string) {
  const children = await browser.bookmarks.getChildren(id);
  return children;
}

function processUrl(url?: string) {
  if (!url) {
    return "";
  }

  if (!url.startsWith("http")) {
    return `https://${url}`;
  }

  return url;
}

/**
 * 创建文件夹或书签
 */
export async function createNode(params: Browser.bookmarks.CreateDetails) {
  try {
    const { parentId = "1", index, title, url } = params;

    const node = await browser.bookmarks.create({
      index,
      parentId,
      title,
      url: processUrl(url),
    });

    return node;
  } catch (err) {
    message.error("创建书签失败: " + err);
    return null;
  }
}

/**
 * 编辑文件夹或书签
 */
export async function editNode(params: { id: string; changes: Browser.bookmarks.UpdateChanges }) {
  try {
    const { id, changes } = params;

    const node = await browser.bookmarks.update(id, changes);
    return node;
  } catch (err) {
    message.error("编辑书签失败: " + err);
    return null;
  }
}

/**
 * 删除文件夹或书签
 */
export async function removeNode(id: string) {
  try {
    await browser.bookmarks.removeTree(id);
    return true;
  } catch (err) {
    message.error("删除失败: " + err);
    return false;
  }
}

/**
 * 移动文件夹或书签到指定位置
 */
export async function moveNode(id: string, destination: { parentId?: string; index?: number }) {
  try {
    const node = await browser.bookmarks.move(id, destination);
    return node;
  } catch (err) {
    message.error("移动失败: " + err);
    return null;
  }
}

/**
 * 搜索书签
 */
export async function searchNode(query: string) {
  const nodes = await browser.bookmarks.search(query);
  return nodes;
}

interface BookmarkTreeNodeChangeInfo {
  title: string;
  url?: string | undefined;
}

interface BookmarkTreeNodeRemoveInfo {
  parentId: string;
  index: number;
  node: globalThis.Browser.bookmarks.BookmarkTreeNode;
}

interface BookmarkTreeNodeMoveInfo {
  parentId: string;
  index: number;
  oldParentId: string;
  oldIndex: number;
}

export function startWatchNode(
  callback?: (
    id: string,
    {
      node,
      changeInfo,
      removeInfo,
    }: {
      node?: Browser.bookmarks.BookmarkTreeNode;
      changeInfo?: BookmarkTreeNodeChangeInfo;
      removeInfo?: BookmarkTreeNodeRemoveInfo;
      moveInfo?: BookmarkTreeNodeMoveInfo;
    },
  ) => void,
) {
  start();

  function start() {
    browser.bookmarks.onCreated.addListener(createCallback);
    browser.bookmarks.onChanged.addListener(changeCallback);
    browser.bookmarks.onRemoved.addListener(removeCallback);
    browser.bookmarks.onMoved.addListener(moveCallback);
  }

  function stop() {
    browser.bookmarks.onCreated.removeListener(createCallback);
    browser.bookmarks.onChanged.removeListener(changeCallback);
    browser.bookmarks.onRemoved.removeListener(removeCallback);
    browser.bookmarks.onMoved.removeListener(moveCallback);
  }

  function createCallback(id: string, node: Browser.bookmarks.BookmarkTreeNode) {
    console.log("watchNodeCreated", id, node);
    callback?.(id, { node });
  }

  function changeCallback(id: string, changeInfo: BookmarkTreeNodeChangeInfo) {
    console.log("watchNodeChanged", id, changeInfo);
    callback?.(id, { changeInfo });
  }

  function removeCallback(id: string, removeInfo: BookmarkTreeNodeRemoveInfo) {
    console.log("watchNodeRemoved", id, removeInfo);
    callback?.(id, { removeInfo });
  }

  function moveCallback(id: string, moveInfo: BookmarkTreeNodeMoveInfo) {
    console.log("watchNodeMoved", id, moveInfo);
    callback?.(id, { moveInfo });
  }

  return stop;
}
