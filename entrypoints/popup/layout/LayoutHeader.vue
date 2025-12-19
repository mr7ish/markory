<template>
  <div class="header-wrapper">
    <div>
      <SearchIsland v-model:="searchText" />
    </div>
    <ModeSwitch />
  </div>
</template>

<script setup lang="ts">
import ModeSwitch from "@/components/ModeSwitch.vue";
import SearchIsland from "@/components/SearchIsland.vue";

const searchText = ref("");

watchEffect(() => {
  console.log("searchText", searchText.value);
});
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
  // background-color: var(--bg-dark);
}
</style>
