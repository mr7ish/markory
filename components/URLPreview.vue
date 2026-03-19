<template>
  <div
    v-if="isVisible"
    class="preview-wrapper"
    :class="[popClass, 'transform-gpu']"
    :style="{
      top: `${top - height - 10}px`,
      left: `${left - 10}px`,
      width: `${width}px`,
      height: `${height}px`,
    }"
  >
    <div
      class="img-wrapper"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
      }"
    >
      <img
        class="preview-img"
        :src="previewSrc"
        alt="preview"
        @load="handleImageLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  isStatic?: boolean;
  imageSrc?: string;
  url?: string;
  width?: number;
  height?: number;
  captureWidth?: number;
  captureHeight?: number;
  top?: number;
  left?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isStatic: false,
  imageSrc: "",
  url: "",
  width: 200,
  height: 100,
  captureWidth: 1536,
  captureHeight: 900,
  top: 0,
  left: 0,
});

const isLoading = ref(true);
const isVisible = ref(false);
const hasPopped = ref(false);

const previewSrc = computed(() => {
  if (props.isStatic) return props.imageSrc;

  const params = new URLSearchParams({
    url: props.url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    colorScheme: "light",
    "viewport.isMobile": "true",
    "viewport.deviceScaleFactor": "1",
    "viewport.width": String(props.captureWidth),
    "viewport.height": String(props.captureHeight),
  });

  return `https://api.microlink.io/?${params.toString()}`;
});

const popClass = computed(() => {
  if (!hasPopped.value) return "";
  return "animate-pop";
});

function showPreview() {
  isVisible.value = true;
  setTimeout(() => {
    hasPopped.value = true;
  }, 200);
}

function hidePreview() {
  isVisible.value = false;
  hasPopped.value = false;
  isLoading.value = true;
}

function handleImageLoad() {
  isLoading.value = false;
}

defineExpose({
  showPreview,
  hidePreview,
});
</script>

<style scoped lang="less">
.preview-wrapper {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.img-wrapper {
  border-radius: 0.625rem;
  overflow: hidden;
  box-shadow: 0 0 10px var(--link-preview-boxshadow);

  .preview-img {
    width: 100%;
    object-fit: cover;
  }
}
.transform-gpu {
  transform: scale3d(0, 0, 1);
  transform-origin: center bottom;
  will-change: transform;
  backface-visibility: hidden;
}

.animate-pop {
  animation: pop 1s ease forwards;
  will-change: transform;
}

@keyframes pop {
  0% {
    transform: scale3d(0.26, 0.26, 1);
  }
  25% {
    transform: scale3d(1.1, 1.1, 1);
  }
  65% {
    transform: scale3d(0.98, 0.98, 1);
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
}
</style>
