<template>
  <svg
    t="1769570841282"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="12061"
    width="200"
    height="200"
  >
    <path
      d="M0 0m102.4 0l819.2 0q102.4 0 102.4 102.4l0 819.2q0 102.4-102.4 102.4l-819.2 0q-102.4 0-102.4-102.4l0-819.2q0-102.4 102.4-102.4Z"
      :fill="isDark ? '#FFFFFF' : '#2c2c2c'"
      p-id="12062"
      data-spm-anchor-id="a313x.search_index.0.i9.183b3a81ilwMG9"
      class="selected"
    ></path>
    <path
      d="M502.272 170.6496a178.0224 178.0224 0 0 1 38.1952 351.8976l-4.096 0.768v65.1264a34.1504 34.1504 0 0 1-29.0304 33.792l-5.0688 0.3584a34.1504 34.1504 0 0 1-33.792-29.0816l-0.3584-5.0688V492.544c0-18.8416 15.3088-34.1504 34.1504-34.1504A109.7216 109.7216 0 1 0 392.5504 348.672a34.1504 34.1504 0 0 1-68.3008 0A178.0224 178.0224 0 0 1 502.272 170.6496z"
      :fill="isDark ? '#2c2c2c' : '#FFFFFF'"
      p-id="12063"
    ></path>
    <path
      d="M502.272 804.2496a59.904 59.904 0 1 0 0-119.8592 59.904 59.904 0 0 0 0 119.8592z"
      :fill="isDark ? '#2c2c2c' : '#FFFFFF'"
      style="transform-origin: 50% bottom; transform: scale(0.9)"
      p-id="12064"
    ></path>
  </svg>
</template>

<script setup lang="ts">
const { isDark = true } = defineProps<{
  isDark?: boolean;
}>();
</script>
