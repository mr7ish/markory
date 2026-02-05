<template>
  <div
    v-if="visible"
    class="tiny-confirm-mask"
    @click="onMaskClick"
  >
    <div
      class="tiny-confirm"
      :style="{
        '--offset-y': offsetY + 'px',
      }"
      @click.stop
    >
      <div
        class="tiny-confirm__title"
        v-if="title"
      >
        {{ title }}
      </div>
      <div class="tiny-confirm__content">
        <slot>{{ content }}</slot>
      </div>

      <div class="tiny-confirm__footer">
        <button
          class="tiny-confirm__btn tiny-confirm__btn--cancel"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          class="tiny-confirm__btn"
          :class="`tiny-confirm__btn--${type}`"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  maskClosable?: boolean;
  type?: "primary" | "danger";
  offsetY?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  content: "确认要执行该操作吗？",
  confirmText: "确认",
  cancelText: "取消",
  maskClosable: true,
  type: "primary",
  offsetY: -200,
});

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const visible = computed(() => props.modelValue);

function close() {
  emit("update:modelValue", false);
}

function handleConfirm() {
  emit("confirm");
  close();
}

function handleCancel() {
  emit("cancel");
  close();
}

function onMaskClick() {
  if (props.maskClosable) {
    handleCancel();
  }
}
</script>

<style scoped lang="less">
.tiny-confirm-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tiny-confirm {
  width: 320px;
  background: var(--confirm-bg-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: tiny-confirm-in 0.15s ease-out;
  margin-top: var(--offset-y);
}

@keyframes tiny-confirm-in {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.tiny-confirm__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.tiny-confirm__content {
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  margin-bottom: 16px;
  word-break: break-word;
}

.tiny-confirm__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.tiny-confirm__btn {
  min-width: 72px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
  color: var(--confirm-btn-color);
  cursor: pointer;
  font-size: 14px;
  text-align: center;
}

.tiny-confirm__btn--primary {
  background: #1677ff;
  border-color: #1677ff;
}

.tiny-confirm__btn--danger {
  background: #ff4d4f;
  border-color: #ff4d4f;
}

.tiny-confirm__btn:hover {
  opacity: 0.9;
}

.tiny-confirm__btn--cancel {
  background: #fff;
  color: #333;
}
</style>
