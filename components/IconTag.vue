<template>
  <Icon v-bind="$props" />
</template>

<script setup lang="ts">
import { Icon, IconProps } from "@iconify/vue";

withDefaults(defineProps<IconProps>(), {
  width: "24",
  color: "currentColor",
});
</script>

<style scoped lang="less"></style>
