<template>
  <div class="tiny-radio-wrapper">
    <button
      class="radio-wrapper"
      @click="checked = !checked"
    >
      <div
        class="indicator"
        :class="{ checked }"
      >
        <div class="border"></div>
        <div class="dot"></div>
      </div>
    </button>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
    checked: boolean;
  }>(),
  {
    label: "radio item",
  },
);
</script>

<style scoped lang="less">
.tiny-radio-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;

  .radio-wrapper {
    background-color: var(--bg-light);
    border: 1px solid var(--bg-dark);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    outline: none;
    cursor: pointer;

    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      position: relative;

      &.checked {
        .border {
          opacity: 1;
          transform: scale(1);
        }

        .dot {
          opacity: 1;
          transform: scale(1);
        }
      }

      .border {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid var(--text);
        opacity: 0;
        transform: scale(0);
        transition: all 0.2s ease;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--primary);
        opacity: 0;
        transform: scale(0);
        transition: all 0.25s ease-in-out;
      }
    }
  }
}
</style>
