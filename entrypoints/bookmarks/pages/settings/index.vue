<template>
  <div>
    <h1>{{ t("menuSettings") }}</h1>

    <button @click="changeLocale('zh')">中文</button>

    <button @click="changeLocale('en')">English</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLocale } from "@/bookmarks/hooks/useLocale";

const { t } = useI18n();
const { changeLocale } = useLocale();
</script>

<style scoped lang="less"></style>
