<template>
  <div class="folders-wrapper">
    <div
      v-for="folder in [...ungroupedFolders, ...folders]"
      :key="folder.id"
      class="folder-item-wrapper"
      @click="clickFolder(folder)"
    >
      <IconTag
        icon="basil:folder-open-solid"
        width="50"
      />
      <div class="desc">
        <div class="title">{{ folder.title }}</div>
        <div
          class="date"
          v-if="folder.dateGroupModified !== 0"
        >
          {{ formatTimestamp(folder.dateGroupModified, DateFormat.f6) }}
        </div>
      </div>
    </div>
  </div>

  <!-- <div class="wrapper">
    <div>
      <div v-for="i in list">
        <img
          :src="i.favicon"
          alt=""
        />
      </div>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import { DateFormat, formatTimestamp, generateFavicon } from "@/utils";
import { useBookmarkFolders } from "../../queries/bookmarks";

interface BookmarkTreeNodeFav extends Browser.bookmarks.BookmarkTreeNode {
  favicon: string;
}

const list = shallowRef<BookmarkTreeNodeFav[]>([]);

const { folders, ungroupedFolders } = useBookmarkFolders();

watchEffect(() => {
  // console.log("folders =>", folders.value);
});

function clickFolder(folder: Browser.bookmarks.BookmarkTreeNode) {
  console.log("clickFolder", folder);
}

async function loadBookmarks() {
  // const get = await browser.bookmarks.get(["5", "6"]);
  // console.log("get", get);

  return;

  // 获取整个书签树
  const tree = await browser.bookmarks.getTree();
  console.log("tree", tree);

  const subtree = await browser.bookmarks.getSubTree("1");
  console.log("subtree", subtree);

  // 获取特定文件夹的子项
  const children = await browser.bookmarks.getChildren("1"); // 一般 "1" 是书签栏
  console.log(children);

  // 获取最近新加的书签
  const bookmarks = await browser.bookmarks.getRecent(10);
  console.log(bookmarks);

  list.value = bookmarks.map((i) => ({
    ...i,
    favicon: generateFavicon(""),
  }));

  // 监听书签变化
  browser.bookmarks.onChanged.addListener((id, changeInfo) => {
    console.log("Bookmark changed:", id, changeInfo);
  });
}

loadBookmarks();
</script>

<style scoped lang="less">
.folders-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 每行3列
  gap: 10px;

  .folder-item-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .desc {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .title {
        font-size: 12px;
      }

      .date {
        font-size: 10px;
        color: #888;
      }
    }
  }
}
</style>
