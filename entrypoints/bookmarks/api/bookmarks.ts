import { message } from "@/components/tiny-message";
import { t } from "@/i18n";

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

/**
 * 获取一组指定节点
 */
export async function fetchSpecifiedNodes(ids: [string, ...string[]]) {
  return await browser.bookmarks.get(ids);
}

export async function fetchSpecifiedNodesSafely(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => browser.bookmarks.get(id)));

  return results
    .filter(
      (
        item,
      ): item is PromiseFulfilledResult<Browser.bookmarks.BookmarkTreeNode[]> =>
        item.status === "fulfilled",
    )
    .flatMap((item) => item.value);
}

function processUrl(url?: string) {
  if (!url) {
    return "";
  }

  if (url.startsWith("chrome://")) {
    return url;
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
    message.error(t("createFailedTips"));
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
    message.error(t("editFailedTips"));
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
    message.error(t("deleteFailedTips"));
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
    message.error(t("moveFailedTips"));
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

export async function initGroupNameBrowser() {
  const res = await browser.bookmarks.search({
    query: t("groupName"),
  });

  if (res.length > 0) {
    const titles = res.map((i) => i.title);
    const maxNum = Math.max(
      ...titles.map((i) => Number(i.replace(t("groupName"), ""))).filter((i) => !isNaN(i)),
    );
    return `${t("groupName")}${maxNum + 1}`;
  }
  return `${t("groupName")}1`;
}

/**
 * 打包标签页到新文件夹
 */
export async function groupTabs(groupId?: string) {
  try {
    const tabs = await browser.tabs.query({
      currentWindow: true,
    });

    let parentId = groupId;

    if (!groupId) {
      const node = await createNode({
        parentId: "1",
        title: await initGroupNameBrowser(),
      });

      if (!node) return null;

      parentId = node.id;
    }

    await Promise.allSettled(
      tabs
        .filter((tab) => !!tab.url && !!tab.title && !tab.url.includes("chrome://bookmarks"))
        .map((tab) =>
          createNode({
            parentId,
            title: tab.title,
            url: tab.url,
          }),
        ),
    );

    return parentId!;
  } catch (err) {
    message.error(t("groupFailedTips"));
    return null;
  }
}

/**
 * 分组打开多个标签页
 */
export async function openGroupedTabs(urls: string[], groupTitle: string) {
  const tabIds = [];

  for (const url of urls) {
    const tab = await browser.tabs.create({
      url,
      active: false,
    });

    tabIds.push(tab.id);

    await new Promise((r) => setTimeout(r, 100));
  }

  const groupId = await browser.tabs.group({
    tabIds: tabIds.filter((i) => i !== undefined) as [number, ...number[]],
  });

  await browser.tabGroups.update(groupId, {
    title: groupTitle,
  });
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
