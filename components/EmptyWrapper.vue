<template>
  <div class="empty-wrapper">
    <img
      class="img-empty"
      src="@/assets/images/empty.svg"
    />
    <div>there is nothing here...</div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.empty-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  // transform: translateY(-50px);

  .img-empty {
    width: 30%;
  }
}
</style>
