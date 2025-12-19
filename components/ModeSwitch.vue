<template>
  <div class="mode-switch-wrapper">
    <div
      ref="iconWrapperRef"
      class="icon-wrapper"
      :class="{ rise: isAnimating }"
      :style="{
        '--duration': duration + 'ms',
      }"
      @click="switchMode"
    >
      <IconTag
        v-if="!isDark"
        :icon="isOutside ? 'uil:sun' : 'tabler:sun-filled'"
      />
      <IconTag
        v-else
        :icon="isOutside ? 'mingcute:moon-line' : 'mingcute:moon-fill'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/entrypoints/popup/hooks/useDarkMode";
import IconTag from "./IconTag.vue";
import { useMouseInElement } from "@vueuse/core";

const { isDarkMode, toggleMode } = useDarkMode();

const iconWrapperRef = useTemplateRef("iconWrapperRef");
const { isOutside } = useMouseInElement(iconWrapperRef);

const isDark = ref(isDarkMode.value);
const isAnimating = ref(false);
// 动画持续时间，单位毫秒
const duration = 500;

function switchMode() {
  if (isAnimating.value) {
    return;
  }

  isAnimating.value = true;

  setTimeout(() => {
    isDark.value = !isDark.value;
  }, duration / 2);

  setTimeout(() => {
    toggleMode();
    isAnimating.value = false;
  }, duration);
}
</script>

<style scoped lang="less">
.mode-switch-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  .icon-wrapper {
    transform-origin: top left;
  }

  .rise {
    animation: rising var(--duration) ease-in-out;
  }
}

@keyframes rising {
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: rotate(90deg);
    opacity: 0;
  }
  50% {
    transform: rotate(180deg);
    opacity: 0;
  }
  75% {
    transform: rotate(270deg);
    opacity: 0;
  }
  100% {
    transform: rotate(360deg);
    opacity: 1;
  }
}
</style>
