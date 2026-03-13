<template>
  <div class="empty-wrapper">
    <img
      class="img-empty"
      src="@/assets/images/empty.svg"
    />
    <div>{{ t("emptyTips") }}</div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

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
    width: 25%;
    user-select: none;
  }
}
</style>
