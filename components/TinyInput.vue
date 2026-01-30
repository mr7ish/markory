<template>
  <div :class="wrapperClass">
    <slot name="prefix" />

    <input
      ref="inputRef"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :class="inputClass"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter="onEnter"
    />

    <button
      v-if="clearable && modelValue && !disabled && !readonly"
      class="clear"
      type="button"
      @click="clear"
    >
      ×
    </button>

    <slot name="suffix" />

    <transition name="fade">
      <p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  modelValue: string | number;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  maxlength?: number;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  placeholder: "",
  disabled: false,
  readonly: false,
  clearable: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", v: string | number): void;
  (e: "focus"): void;
  (e: "blur"): void;
  (e: "enter"): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const wrapperClass = computed(() => [
  "input-wrapper",
  { disabled: props.disabled, error: !!props.error },
]);

const inputClass = computed(() => ["input"]);

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", value);
}

function onFocus() {
  emit("focus");
}

function onBlur() {
  emit("blur");
}

function onEnter() {
  emit("enter");
}

function clear() {
  emit("update:modelValue", "");
  inputRef.value?.focus();
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<style scoped lang="less">
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  // border: 1px solid #dcdcdc;
  border-radius: 6px;
  background-color: var(--bg-light);

  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus-within {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
  }

  &.disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &.error {
    border-color: #f56c6c;
  }
}

.input {
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  width: 100%;
  color: var(--text);

  &:disabled {
    cursor: not-allowed;
  }
}

.clear {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}

.error {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
