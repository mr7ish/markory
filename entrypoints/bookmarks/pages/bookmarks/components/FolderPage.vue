<template>
  <div class="folder-page-wrapper">
    <div
      v-if="allNodes.length > 0"
      class="folders-wrapper"
    >
      <div
        v-for="node in allNodes"
        :key="node.id"
        class="folder-item-wrapper"
        @click="jumpFolder(node)"
      >
        <IconTag
          v-if="!node.url"
          icon="basil:folder-open-solid"
          width="50"
        />
        <div
          v-else
          class="icon-wrapper"
        >
          <img
            :src="generateFavicon(node.url)"
            class="icon"
          />
        </div>

        <div class="desc">
          <div
            class="title multi-line-webkit"
            :title="node.title"
          >
            {{ node.title }}
          </div>
          <div
            class="date"
            v-if="node.dateGroupModified !== 0"
          >
            {{ formatTimestamp(node.dateGroupModified, DateFormat.f6) }}
          </div>
        </div>
      </div>
    </div>
    <EmptyWrapper v-else />
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
import {
  useBookmarkFolders,
  useFolderChildrenQuery,
} from "@/entrypoints/bookmarks/queries/bookmarks";
import EmptyWrapper from "@/components/EmptyWrapper.vue";
import { useRoute, useRouter } from "vue-router";

interface BookmarkTreeNodeFav extends Browser.bookmarks.BookmarkTreeNode {
  favicon: string;
}

const list = shallowRef<BookmarkTreeNodeFav[]>([]);

const { folders, ungroupedFolders } = useBookmarkFolders();

const allFolders = computed(() => {
  return [
    ...ungroupedFolders.value,
    ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
    // ...folders.value,
  ];
});

const { childrenNodes } = useFolderChildrenQuery();

const allNodes = computed(() => {
  if (route.params.id !== "root") {
    return childrenNodes.value;
  } else {
    return allFolders.value;
  }
});

const route = useRoute();
const router = useRouter();

watchEffect(() => {
  console.log("allNodes =>", allNodes.value);
});

function jumpFolder(node: Browser.bookmarks.BookmarkTreeNode) {
  console.log("clickFolder", node);

  if (node.url) {
    // browser.windows.create({
    //   url: node.url,
    //   type: "normal",
    // });

    // return;

    browser.runtime.sendMessage({ action: "openTab", url: node.url });

    return;
  }

  router.push({
    name: "bookmarks-folder",
    params: {
      id: node.id,
    },
    query: {
      title: node.title,
    },
  });
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
.folder-page-wrapper {
  height: 100%;
  overflow-y: auto;

  .folders-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr); // 每行3列
    gap: 50px;
    row-gap: 30px;

    .folder-item-wrapper {
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      .icon-wrapper {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
          width: 32px;
          object-fit: cover;
        }
      }

      .desc {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .title {
          font-size: 12px;
          line-height: 1.2;
        }

        .date {
          font-size: 10px;
          color: #888;
        }
      }

      &:hover {
        background-color: var(--folder-hover-fill);
        border-radius: 8px;
      }
    }
  }
}
</style>
