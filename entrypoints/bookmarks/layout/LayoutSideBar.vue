<template>
  <div class="side-bar-wrapper">
    <div class="header">
      <TransitionGroup
        name="logo"
        tag="div"
        class="logo-wrapper"
        :class="{ collapsed: isCollapsed }"
      >
        <LogoFull
          v-if="isCollapsed"
          key="logo-full"
          class="logo-item logo-full"
          style="width: 80px"
        />
        <LogoIcon
          v-else
          key="logo-icon"
          class="logo-item logo-icon"
          style="width: 20px"
        />
      </TransitionGroup>
      <div
        class="menu-wrapper"
        :class="{ collapsed: !isCollapsed }"
        :style="{
          '--menu-item-height': menuItemHeight + 'px',
          '--menu-item-gap': menuItemGap + 'px',
        }"
      >
        <div
          v-for="(menu, index) in menus"
          :key="menu.key"
          class="menu-item animate__animated"
          :class="{
            animate__bounceIn: activeKey === menu.key,
          }"
          @click="menuClick(menu, index)"
        >
          <IconTag
            :icon="activeKey === menu.key ? menu.activeIcon : menu.icon"
            width="18"
            style="flex-shrink: 0"
          />
          <div
            class="title-wrapper"
            :class="{ collapsed: !isCollapsed }"
          >
            {{ menu.title }}
          </div>
        </div>
        <div
          class="cursor"
          :style="{
            '--offset': offset * (menuItemGap + menuItemHeight) + 'px',
          }"
        />
      </div>
    </div>
    <div
      class="footer"
      :class="{ collapsed: !isCollapsed }"
    >
      <LineCheckbox
        :value="isCollapsed"
        style="transform: scale(0.6)"
        @change="toggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LineCheckbox from "@/components/LineCheckbox.vue";
import IconTag from "@/components/IconTag.vue";
import { useStorage } from "@vueuse/core";
import LogoFull from "@/components/LogoFull.vue";
import LogoIcon from "@/components/LogoIcon.vue";

const activeKey = ref("home");
const menuItemGap = 30;
const menuItemHeight = 40;
const offset = ref(0);
const isCollapsed = useStorage("is-collapsed", false);

const menus = [
  {
    key: "home",
    title: "Home",
    icon: "solar:home-smile-linear",
    activeIcon: "solar:home-smile-bold",
    path: "/",
  },
  {
    key: "home2",
    title: "Home",
    icon: "solar:home-smile-linear",
    activeIcon: "solar:home-smile-bold",
    path: "/",
  },
  {
    key: "home3",
    title: "Home",
    icon: "solar:home-smile-linear",
    activeIcon: "solar:home-smile-bold",
    path: "/",
  },
  {
    key: "settings",
    title: "Settings",
    icon: "famicons:settings-outline",
    activeIcon: "famicons:settings-sharp",
    path: "/",
  },
];

function menuClick(menu: (typeof menus)[0], index: number) {
  activeKey.value = menu.key;
  offset.value = index;
}

function toggle(_isCollapsed: boolean) {
  isCollapsed.value = _isCollapsed;
}
</script>

<style scoped lang="less">
.side-bar-wrapper {
  padding: 12px;
  background-color: var(--side-bar-bg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;

    .logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 40px;
      height: 40px;

      &.collapsed {
        width: 80px;
        height: 40px;
      }
    }

    .logo-item {
      position: absolute;
    }

    // LogoFull 动画 - 使用 animate.css 的 keyframes
    .logo-full.logo-enter-active {
      animation-name: zoomInDown;
      animation-duration: 0.75s;
      animation-delay: 0.25s;
      animation-fill-mode: both;
    }

    .logo-full.logo-leave-active {
      animation-name: zoomOutUp;
      animation-duration: 0.75s;
      animation-fill-mode: both;
    }

    // LogoIcon 动画 - 使用 animate.css 的 keyframes
    .logo-icon.logo-enter-active {
      animation-name: zoomInLeft;
      animation-duration: 0.75s;
      animation-delay: 0.25s;
      animation-fill-mode: both;
    }

    .logo-icon.logo-leave-active {
      animation-name: zoomOutUp;
      animation-duration: 0.75s;
      animation-fill-mode: both;
    }

    .menu-wrapper {
      width: 160px;
      display: flex;
      flex-direction: column;
      gap: var(--menu-item-gap);
      position: relative;
      transition: width 0.25s ease;

      &.collapsed {
        width: 40px;
      }

      .menu-item {
        height: var(--menu-item-height);
        padding: 0 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        position: relative;
        z-index: 2;

        .title-wrapper {
          transition: all 0.25s ease;
          opacity: 1;

          &.collapsed {
            width: 0;
            font-size: 0;
            opacity: 0;
          }
        }
      }

      .cursor {
        width: 100%;
        height: 40px;
        background-color: var(--menu-selected-bg);
        border-radius: 4px;
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        transform: translateY(var(--offset));
        transition: transform 0.25s ease;
      }
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;

    &.collapsed {
      justify-content: center;
    }
  }
}
</style>
