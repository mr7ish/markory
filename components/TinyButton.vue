<template>
  <button
    :type="nativeType"
    :disabled="disabled || loading"
    :class="buttonClass"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="loading-icon"
    >
      <svg
        class="spinner"
        viewBox="0 0 24 24"
      >
        <circle
          class="spinner-path"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke-width="2"
        />
      </svg>
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

type ButtonType =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
type ButtonSize = "small" | "medium" | "large";
type NativeButtonType = "button" | "submit" | "reset";

interface Props {
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  nativeType?: NativeButtonType;
}

const props = withDefaults(defineProps<Props>(), {
  type: "primary",
  size: "medium",
  disabled: false,
  loading: false,
  nativeType: "button",
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const buttonClass = computed(() => [
  "tiny-button",
  `tiny-button--${props.type}`,
  `tiny-button--${props.size}`,
  {
    "tiny-button--disabled": props.disabled,
    "tiny-button--loading": props.loading,
  },
]);

function onClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
}
</script>

<style scoped lang="less">
.tiny-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  position: relative;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  // Primary
  &--primary {
    background: var(--primary);
    // color: var(--bg-light);
    color: var(--text);
    border-color: var(--primary);

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: var(--shadow-s);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  // Secondary
  &--secondary {
    // background: var(--bg);
    background: var(--bg-dark);
    color: var(--text);
    border-color: var(--bg-dark);

    &:hover:not(:disabled) {
      background: var(--bg-dark);
      border-color: var(--bg-dark);
    }
  }

  // Success
  &--success {
    background: oklch(65% 0.15 150);
    color: var(--bg-light);
    border-color: oklch(65% 0.15 150);

    &:hover:not(:disabled) {
      background: oklch(60% 0.15 150);
      border-color: oklch(60% 0.15 150);
    }
  }

  // Warning
  &--warning {
    background: oklch(75% 0.15 85);
    color: var(--bg-light);
    border-color: oklch(75% 0.15 85);

    &:hover:not(:disabled) {
      background: oklch(70% 0.15 85);
      border-color: oklch(70% 0.15 85);
    }
  }

  // Danger
  &--danger {
    background: oklch(60% 0.2 25);
    color: var(--bg-light);
    border-color: oklch(60% 0.2 25);

    &:hover:not(:disabled) {
      background: oklch(55% 0.2 25);
      border-color: oklch(55% 0.2 25);
    }
  }

  // Info
  &--info {
    background: oklch(70% 0.15 240);
    color: var(--bg-light);
    border-color: oklch(70% 0.15 240);

    &:hover:not(:disabled) {
      background: oklch(65% 0.15 240);
      border-color: oklch(65% 0.15 240);
    }
  }

  // Sizes
  &--small {
    padding: 6px 12px;
    font-size: 12px;
  }

  &--medium {
    padding: 8px 16px;
    font-size: 14px;
  }

  &--large {
    padding: 12px 24px;
    font-size: 16px;
  }

  // States
  &--disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--loading {
    cursor: wait;
    pointer-events: none;
  }
}

.loading-icon {
  display: inline-flex;
  align-items: center;
  margin-right: -6px;
}

.spinner {
  width: 14px;
  height: 14px;
  animation: spin 0.8s linear infinite;
}

.spinner-path {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dasharray: 31.416;
  stroke-dashoffset: 31.416;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -125;
  }
}

// Dark mode adjustments
:root.dark {
  .tiny-button {
    &--secondary {
      background: var(--bg-light);
      color: var(--text);
      border-color: var(--bg-light);

      &:hover:not(:disabled) {
        // background: var(--bg);
        background: var(--bg-light);
        border-color: var(--bg);
      }
    }

    &--success {
      background: oklch(70% 0.15 150);
      border-color: oklch(70% 0.15 150);
    }

    &--warning {
      background: oklch(80% 0.15 85);
      border-color: oklch(80% 0.15 85);
    }

    &--danger {
      background: oklch(65% 0.2 25);
      border-color: oklch(65% 0.2 25);
    }

    &--info {
      background: oklch(75% 0.15 240);
      border-color: oklch(75% 0.15 240);
    }
  }
}
</style>
