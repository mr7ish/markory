<template>
  <div
    class="layout-wrapper"
    @contextmenu.prevent
  >
    <LayoutSideBar />
    <div class="layout-main">
      <LayoutHeader />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import LayoutSideBar from "./LayoutSideBar.vue";
import LayoutHeader from "./LayoutHeader.vue";
</script>

<style scoped lang="less">
.layout-wrapper {
  width: 100%;
  height: 100%;
  display: flex;

  .layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;

    .layout-content {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>
