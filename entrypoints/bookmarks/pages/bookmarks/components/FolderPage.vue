<template>
  <div
    class="node-page-wrapper"
    @contextmenu="openContextMenu"
  >
    <div
      v-if="topNodes.length > 0"
      class="nodes-wrapper"
    >
      <div
        v-for="node in topNodes"
        :key="node.id"
        class="node-item-wrapper"
        @click="clickNode(node)"
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
            :src="
              isSystemIcon(node.url) ? systemIcon : generateFavicon(node.url)
            "
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

    <ContextMenu
      v-model:visible="visible"
      :x="x"
      :y="y"
      :menus="menus"
      @select="contextMenuSelect"
    />

    <TinyModal
      v-model="modalVisible"
      width="320px"
      :closeOnMask="false"
      destroyOnClose
    >
      <template #header>
        {{ modalTitle }}
      </template>
      <NewFolder
        @cancel="modalVisible = false"
        @confirm="getValues"
      />
    </TinyModal>
  </div>
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import { DateFormat, formatTimestamp, generateFavicon } from "@/utils";
import {
  useBookmarkTopNodes,
  useFolderChildrenQuery,
} from "@/entrypoints/bookmarks/queries/bookmarks";
import EmptyWrapper from "@/components/EmptyWrapper.vue";
import { useRoute, useRouter } from "vue-router";
import ContextMenu from "@/components/context-menu/index.vue";
import { useContextMenu } from "@/components/context-menu/hooks/useContextMenu";
import TinyModal from "@/components/TinyModal.vue";
import { ContextMenuItem } from "@/components/context-menu";
import NewFolder, { FormValues } from "./NewFolder.vue";
import { useDarkMode } from "@/bookmarks/hooks/useDarkMode";
import blackLogo from "@/assets/logo-black.svg";
import whiteLogo from "@/assets/logo-white.svg";

interface BookmarkTreeNodeFav extends Browser.bookmarks.BookmarkTreeNode {
  favicon: string;
}

const { isDarkMode } = useDarkMode();

function isSystemIcon(url: string) {
  return ["chrome://bookmarks/"].includes(url);
}

const systemIcon = computed(() => (isDarkMode.value ? whiteLogo : blackLogo));

const modalVisible = ref(false);
const modalTitle = ref("");

const { x, y, visible, menus, openContextMenu } = useContextMenu();

function contextMenuSelect(item: ContextMenuItem) {
  console.log("contextMenuSelect =>", item);

  modalVisible.value = true;
  modalTitle.value = item.label;
}

menus.value = [
  { label: "新建文件夹", value: "new-folder" },
  { label: "新建书签", value: "new-bookmark" },
];

function getValues(values: FormValues) {
  console.log("getValues", values);
}

const list = shallowRef<BookmarkTreeNodeFav[]>([]);

const { topNodes } = useBookmarkTopNodes();

const { childrenNodes } = useFolderChildrenQuery();

const route = useRoute();
const router = useRouter();

watchEffect(() => {
  console.log("topNodes =>", topNodes.value);
});

function clickNode(node: Browser.bookmarks.BookmarkTreeNode) {
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

  // browser.bookmarks.move

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
.node-page-wrapper {
  height: 100%;
  overflow-y: auto;

  .nodes-wrapper {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(150px, 1fr)
    ); // 根据宽度自动适应列数
    gap: 50px;
    row-gap: 30px;

    .node-item-wrapper {
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
