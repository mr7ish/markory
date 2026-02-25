<template>
  <div class="header-wrapper">
    <div>
      <SearchIsland />
    </div>
    <ModeSwitch />
  </div>
</template>

<script setup lang="ts">
import ModeSwitch from "@/components/ModeSwitch.vue";
import SearchIsland from "@/components/SearchIsland.vue";
</script>

<style scoped lang="less">
.header-wrapper {
  width: 100%;
  height: 60px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-light);
}
</style>
