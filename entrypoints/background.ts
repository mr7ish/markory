export default defineBackground(() => {
  // console.log("Hello background!", { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "markory",
      title: "markory",
      contexts: ["page"],
    });

    browser.contextMenus.create({
      id: "group-tabs",
      parentId: "markory",
      title: "打包当前窗口所有标签页",
      contexts: ["page"],
    });
  });

  browser.contextMenus.onClicked.addListener(async (info, _tab) => {
    if (info.menuItemId === "group-tabs") {
      const { locale = "zh" } = await browser.storage.local.get("locale");

      const groupId = await groupTabs(await initGroupNameBackground(locale));
      if (!groupId) return;

      const { groupIds = [] } = await browser.storage.local.get("groupIds");
      // console.log("groupIds => ", groupIds);

      browser.storage.local.set({
        groupIds: [...groupIds, groupId],
      });
    }
  });
});

async function groupTabs(title: string) {
  try {
    const tabs = await browser.tabs.query({
      currentWindow: true,
    });

    const node = await createNode({
      parentId: "1",
      title,
    });

    if (!node) return null;

    await Promise.allSettled(
      tabs
        .filter((tab) => !!tab.url && !!tab.title && !tab.url.includes("chrome://bookmarks"))
        .map((tab) =>
          createNode({
            parentId: node.id,
            title: tab.title,
            url: tab.url,
          }),
        ),
    );

    return node.id;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function createNode(params: Browser.bookmarks.CreateDetails) {
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
    console.error(err);
    return null;
  }
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

async function initGroupNameBackground(locale: "en" | "zh") {
  const mapping = {
    en: "Group",
    zh: "分组",
  };

  const query = mapping[locale];

  const res = await browser.bookmarks.search({
    query,
  });

  if (res.length > 0) {
    const titles = res.map((i) => i.title);
    const maxNum = Math.max(
      ...titles.map((i) => Number(i.replace(query, ""))).filter((i) => !isNaN(i)),
    );
    return `${query}${maxNum + 1}`;
  }
  return `${query}1`;
}
