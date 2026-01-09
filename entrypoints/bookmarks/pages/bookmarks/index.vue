<template>
  <div class="bookmark-layout-wrapper">
    <BreadCrumb />
    <div class="bookmark-content-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadCrumb from "./components/BreadCrumb.vue";
</script>

<style scoped lang="less">
.bookmark-layout-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .bookmark-content-wrapper {
    flex: 1;
    overflow: hidden;
  }
}
</style>
