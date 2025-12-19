<template>
  <div class="search-island-wrapper">
    <div
      class="icon-wrapper animate__animated"
      :class="{ animate__jello: isFocus }"
    >
      <IconTag
        icon="lets-icons:search"
        width="18"
        color="var(--text-muted)"
        style="transform: translateY(2px)"
      />
    </div>
    <input
      ref="inputRef"
      id="search-input"
      type="text"
      class="input-wrapper"
      placeholder="Search"
      v-model="modelValue"
      @focusin="isFocus = true"
      @focusout="isFocus = false"
    />

    <div
      class="icon-clear"
      v-if="!isOutside && modelValue.length > 0"
      @click="clear"
      title="clear"
    >
      <IconTag
        icon="lets-icons:close-ring"
        width="18"
        color="var(--text-muted)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onStartTyping, useMouseInElement } from "@vueuse/core";
import IconTag from "./IconTag.vue";

const inputRef = useTemplateRef("inputRef");
const { isOutside } = useMouseInElement(inputRef);

const modelValue = defineModel("modelValue", { default: "" });
const isFocus = ref(false);

onStartTyping(() => {
  inputRef.value?.focus();
});

function clear() {
  modelValue.value = "";
}
</script>

<style scoped lang="less">
.search-island-wrapper {
  width: 300px;
  height: 36px;
  padding: 0px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;

  background-color: var(--bg-light);
  box-shadow: var(--shadow-s);

  position: relative;

  .input-wrapper {
    flex: 1;
    height: 18px;
    padding: 0;
    border: none;
    outline: none;
    background-color: transparent;
    font-size: 13px;
    color: var(--text-muted);
    caret-color: currentColor;
    transform: translateY(1px);
  }

  .input-wrapper::placeholder {
    color: var(--text-muted);
    font-size: 13px;
  }

  .icon-clear {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-light);
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(calc(-50% + 2px));
    cursor: pointer;
  }
}
</style>
