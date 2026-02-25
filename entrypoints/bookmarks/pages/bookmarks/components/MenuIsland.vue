<template>
  <div class="menu-island">
    <div
      v-for="menu in menus"
      :key="menu.id"
      class="menu-item"
      @click="clickMenu(menu)"
    >
      <IconTag
        :icon="activeMenu === menu.id ? menu.activeIcon : menu.icon"
        width="20"
        class="animate__animated"
        :class="{
          animate__bounceIn: activeMenu === menu.id,
        }"
      />
      <div class="menu-tooltip">
        {{ menu.title }}
      </div>
    </div>
    <div
      class="cursor"
      :style="{
        '--offset': `${offset * (36 + 10)}px`,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useRoutesStore } from "@/bookmarks/store/routes";
import IconTag from "@/components/IconTag.vue";
import { storeToRefs } from "pinia";

const routesStore = useRoutesStore();
const { menus, setActiveMenu, setRoutes } = routesStore;
const { activeMenu } = storeToRefs(routesStore);

const offset = computed(() => menus.findIndex((menu) => menu.id === activeMenu.value));

function clickMenu(menu: (typeof menus)[0]) {
  setActiveMenu(menu.id);

  setRoutes([
    {
      id: menu.id,
      title: menu.title,
    },
  ]);
}
</script>

<style scoped lang="less">
.menu-island {
  padding: 8px;
  border-radius: 28px;
  display: flex;
  gap: 10px;

  position: absolute;
  left: 50%;
  bottom: 60px;
  transform: translateX(-50%);

  background-color: var(--bg-light);
  box-shadow: var(--shadow-s);

  .menu-item {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    z-index: 2;
  }

  .menu-tooltip {
    position: absolute;
    left: 50%;
    bottom: 48px;
    transform: translateX(-50%) translateY(4px) scale(0.96);
    transform-origin: bottom center;
    padding: 8px 12px;
    border-radius: 4px;
    background-color: var(--bg-dark);
    box-shadow: var(--shadow-m);
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
    z-index: 10;
  }

  .menu-item:hover .menu-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  .cursor {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--menu-selected-bg);

    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateX(var(--offset)) translateY(-50%);
    transition: transform 0.25s ease;
    pointer-events: none;
  }
}
</style>
