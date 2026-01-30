<template>
  <div class="message-notice-wrapper">
    <component :is="icon" />
    <span>{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NoticeType } from ".";
import IconWarning from "./components/IconWarning.vue";
import IconSuccess from "./components/IconSuccess.vue";
import IconError from "./components/IconError.vue";
import IconInfo from "./components/IconInfo.vue";

const props = withDefaults(
  defineProps<{
    type: NoticeType;
    content?: string;
  }>(),
  {
    type: "success",
    content: "",
  },
);

const fillColor = computed(() => {
  if (props.type === "success") return "#49AA19";
  if (props.type === "error") return "#DC4446";
  if (props.type === "warning") return "#D89614";
  if (props.type === "info") return "#1668DC";
});

const icon = computed(() => {
  if (props.type === "success") return IconSuccess;
  if (props.type === "error") return IconError;
  if (props.type === "warning") return IconWarning;
  return IconInfo;
});
</script>

<style scoped lang="less">
.message-notice-wrapper {
  --font-size: 0.875rem;

  padding: 0.5rem 0.875rem;
  font-size: var(--font-size);
  color: var(--text);
  line-height: 1.5714285714285714;

  border-radius: 0.75rem;
  background-color: var(--message-bg-color);

  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  display: flex;
  align-items: center;
  gap: 0.5rem;

  :deep(.icon) {
    width: 1rem;
    height: 1rem;

    .path-body {
      fill: v-bind(fillColor);
    }
  }
}

@media (max-width: 480px) {
  .message-notice-wrapper {
    --font-size: 0.7rem;
  }
}
</style>
