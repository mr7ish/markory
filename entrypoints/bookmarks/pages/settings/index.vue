<template>
  <div class="page-wrapper">
    <div class="title">{{ t("menuSettings") }}</div>

    <div class="content">
      <div class="setting-item">
        <div class="label">{{ t("lang") }}</div>
        <div class="radio-group">
          <TinyRadio
            class="radio-item"
            :label="t('langZh')"
            :checked="locale === 'zh'"
            @click="changeLocale('zh')"
          />
          <TinyRadio
            class="radio-item"
            :label="t('langEn')"
            :checked="locale === 'en'"
            @click="changeLocale('en')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLocale } from "@/bookmarks/hooks/useLocale";
import TinyRadio from "@/components/tiny-raido";

const { t } = useI18n();
const { changeLocale, locale } = useLocale();
</script>

<style scoped lang="less">
.page-wrapper {
  height: 100%;
  padding: 20px;

  .title {
    font-size: 16px;
    font-weight: bold;
    line-height: 24px;
  }

  .content {
    padding: 20px;

    .setting-item {
      display: flex;
      align-items: center;

      .label {
        width: 80px;
        flex-shrink: 0;
      }

      .radio-group {
        display: flex;
        gap: 8px;

        .radio-item {
          width: 100px;
        }
      }
    }
  }
}
</style>
