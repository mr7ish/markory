<template>
  <div class="search-island-wrapper">
    <div
      ref="searchWrapperRef"
      class="search-wrapper"
      :class="{
        expanded: isFocus,
        fixed: isFocus,
      }"
      :style="{
        transform: `translate(${moveDistance[0]}px, ${moveDistance[1]}px)`,
      }"
    >
      <div
        class="icon-wrapper animate__animated"
        :class="{ animate__jello: isFocus }"
      >
        <IconTag
          icon="lets-icons:search"
          width="18"
          color="var(--text-muted)"
          style="transform: translateY(2px)"
        />
      </div>
      <input
        ref="inputRef"
        id="search-input"
        type="text"
        class="input-wrapper"
        :placeholder="t('searchPlaceholder')"
        v-model.trim="modelValue"
        @focusin="focusIn"
        autocomplete="off"
      />

      <div
        class="icon-clear"
        v-if="!isOutside && modelValue.length > 0"
        @click="clear"
        title="clear"
      >
        <IconTag
          icon="lets-icons:close-ring"
          width="18"
          color="var(--text-muted)"
        />
      </div>

      <div
        v-show="isFocus && nodes.length > 0"
        class="result-wrapper"
      >
        <div
          v-for="node in nodes"
          :key="node.id"
          class="result-item"
          @click="selectNode(node)"
        >
          <IconTag
            v-if="!node.url"
            icon="basil:folder-open-solid"
            width="24"
          />
          <IconTag
            v-else
            icon="icon-park-solid:bookmark-three"
            width="22"
          />
          <!-- icon="ion:earth-sharp" -->
          <span
            class="node-title text-overflow-hidden"
            :title="node.title"
          >
            {{ node.title }}
          </span>
        </div>
      </div>
    </div>

    <teleport
      to="body"
      v-if="isFocus"
    >
      <div
        class="popover"
        @click="focusOut"
      ></div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useMouseInElement, watchDebounced } from "@vueuse/core";
import IconTag from "./IconTag.vue";
import { calcMoveDistance, Vector2 } from "@/utils/element";
import { searchNode } from "@/bookmarks/api/bookmarks";
import { useSearchStore } from "@/bookmarks/store/search";
import { useRoute, useRouter } from "vue-router";
import { useRoutesStore } from "@/bookmarks/store/routes";
import { useRecycleStore } from "@/bookmarks/store/recycle";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const searchWrapperRef = useTemplateRef("searchWrapperRef");
const inputRef = useTemplateRef("inputRef");
const { isOutside } = useMouseInElement(inputRef);

const modelValue = ref("");
const isFocus = ref(false);
const moveDistance = ref<Vector2>([0, 0]);

const nodes = shallowRef<Browser.bookmarks.BookmarkTreeNode[]>([]);

const { findPathByMap } = useSearchStore();
const routesStore = useRoutesStore();
const { menus, setRoutes, setActiveMenu } = routesStore;
const { activeMenu } = storeToRefs(routesStore);

const recycleStore = useRecycleStore();
const { allRecycleNodeIds } = storeToRefs(recycleStore);

watchDebounced(
  modelValue,
  (newValue) => {
    search(newValue);
  },
  {
    debounce: 300,
  },
);

async function selectNode(node: Browser.bookmarks.BookmarkTreeNode) {
  const pathNodes = findPathByMap(node.id);

  if (activeMenu.value !== menus[0].id) {
    setActiveMenu(menus[0].id);
  }

  setRoutes([
    {
      id: menus[0].id,
      title: menus[0].title,
    },
    ...(!node.url ? pathNodes : pathNodes.slice(0, -1)).map((node) => ({
      id: node.id,
      title: node.title,
    })),
  ]);

  focusOut();

  if (!route.fullPath.startsWith("/bookmarks")) {
    router.push({
      name: "bookmarks",
    });
  }

  if (node.url) {
    browser.tabs.create({ url: node.url });
  }
}

async function search(query: string) {
  const _nodes = await searchNode(query);
  nodes.value = _nodes.filter((i) => !allRecycleNodeIds.value.includes(i.id));
}

function clear() {
  modelValue.value = "";
}

async function focusIn() {
  if (isFocus.value) return;
  isFocus.value = true;
  await nextTick();
  const [moveX, moveY] = calcMoveDistance(searchWrapperRef.value!);
  moveDistance.value = [moveX, moveY / 3];
}

function focusOut() {
  isFocus.value = false;
  moveDistance.value = [0, 0];
  clear();
}
</script>

<style scoped lang="less">
::-webkit-scrollbar {
  width: 8px;
  height: 6px;
  background-color: transparent;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 5px;
}

.popover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.search-island-wrapper {
  position: relative;

  .search-wrapper {
    width: 300px;
    height: 36px;
    padding: 0px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 10px;

    background-color: var(--bg-light);
    box-shadow: var(--shadow-s);

    position: relative;
    transition: all 0.3s ease-out;

    &.expanded {
      width: 400px;
    }

    &.fixed {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 3;
    }

    .result-wrapper {
      width: 450px;
      height: 300px;
      padding: 12px;
      background-color: var(--bg-light);
      box-shadow: var(--shadow-s);
      border-radius: 4px;
      overflow-y: auto;

      position: absolute;
      left: 50%;
      top: 40px;
      transform: translateX(-50%);

      .result-item {
        height: 36px;
        line-height: 36px;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        border-radius: 4px;

        &:hover {
          background-color: var(--bg-hover);
        }

        .node-title {
          max-width: 300px;
        }
      }
    }

    .input-wrapper {
      flex: 1;
      height: 18px;
      padding: 0;
      border: none;
      outline: none;
      background-color: transparent;
      font-size: 13px;
      color: var(--text-muted);
      caret-color: currentColor;
      transform: translateY(1px);
    }

    .input-wrapper::placeholder {
      color: var(--text-muted);
      font-size: 13px;
    }

    .icon-clear {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-light);
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(calc(-50% + 2px));
      cursor: pointer;
    }
  }
}
</style>
