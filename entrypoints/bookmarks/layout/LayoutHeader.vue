<template>
  <div class="header-wrapper">
    <div v-if="activeKey === 'menuHome'">
      <SearchIsland />
    </div>
    <ModeSwitch style="margin-left: auto" />
  </div>
</template>

<script setup lang="ts">
import ModeSwitch from "@/components/ModeSwitch.vue";
import SearchIsland from "@/components/SearchIsland.vue";
import { useStorage } from "@vueuse/core";

const activeKey = useStorage("active-menu-key", "menuHome");
</script>

<style scoped lang="less">
.header-wrapper {
  width: 100%;
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  background-color: var(--bg-light);
}
</style>
