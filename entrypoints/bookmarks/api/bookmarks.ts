/**
 * 获取书签栏和其他书签下的所有一级文件夹和书签
 */
export async function fetchAllNodes() {
  const res = await Promise.allSettled([
    browser.bookmarks.getChildren("1"),
    browser.bookmarks.getChildren("2"),
  ]);

  const nodes = res
    .map((i) => (i.status === "fulfilled" ? i.value : []))
    .flat();

  return nodes;
}

/**
 * 获取书签栏和其他书签下的所有一级文件夹
 */
export async function fetchBookmarkFolders() {
  const nodes = await fetchAllNodes();

  const folders = nodes.filter((node) => !node.url);

  const ungroupedFolder: Browser.bookmarks.BookmarkTreeNode = {
    dateAdded: 0,
    dateGroupModified: 0,
    id: "-1",
    index: 0,
    parentId: "0",
    syncing: false,
    title: "ungrouped",
  };

  return {
    folders,
    ungroupedFolders: nodes.length > folders.length ? [ungroupedFolder] : [],
  };
}

/**
 * 获取书签栏和其他书签下的所有一级未分组书签
 */
export async function fetchUngroupedBookmarks() {
  const nodes = await fetchAllNodes();

  return nodes.filter((node) => node.url);
}

/**
 * 获取特定文件夹的子项
 */
export async function fetchFolderChildren(id: string) {
  // 获取特定文件夹的子项
  const children = await browser.bookmarks.getChildren(id);
  return children;
}
