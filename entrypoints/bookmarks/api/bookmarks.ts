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

interface BookmarkTreeNodeChangeInfo {
  title: string;
  url?: string | undefined;
}

interface BookmarkTreeNodeRemoveInfo {
  parentId: string;
  index: number;
  node: globalThis.Browser.bookmarks.BookmarkTreeNode;
}

export function watchNode(
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
    },
  ) => void,
) {
  browser.bookmarks.onCreated.addListener((id, node) => {
    console.log("watchNodeCreated", id, node);
    callback?.(id, { node });
  });

  browser.bookmarks.onChanged.addListener((id, changeInfo) => {
    console.log("watchNodeChanged", id, changeInfo);
    callback?.(id, { changeInfo });
  });

  browser.bookmarks.onRemoved.addListener((id, removeInfo) => {
    console.log("watchNodeRemoved", id, removeInfo);
    callback?.(id, { removeInfo });
  });
}
