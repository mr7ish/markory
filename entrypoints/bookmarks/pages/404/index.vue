<template>
  <div class="not-found">
    <img
      class="img-404"
      src="@/assets/images/404.svg"
    />
    <div>page not found...</div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  transform: translateY(-50px);

  .img-404 {
    width: 25%;
    user-select: none;
  }
}
</style>
