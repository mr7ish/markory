import { groupTabs } from "@/bookmarks/api/bookmarks";

export default defineBackground(() => {
  // console.log("Hello background!", { id: browser.runtime.id });

  // background.js

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
      const tabs = await browser.tabs.query({
        currentWindow: true,
      });

      await groupTabs(tabs);
    }
  });
});
