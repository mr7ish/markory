<template>
  <div class="not-found">
    <img
      class="img-404"
      src="@/assets/images/404.svg"
    />
    <div>{{ t("pageNotFoundTips") }}</div>

    <TinyButton
      type="primary"
      @click="back"
    >
      {{ t("menuHome") }}
    </TinyButton>
  </div>
</template>

<script setup lang="ts">
import TinyButton from "@/components/TinyButton.vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const router = useRouter();
const back = () => {
  router.push({ name: "bookmarks" });
};

const { t } = useI18n();
</script>

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
