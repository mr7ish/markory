<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="rendered"
        class="modal-mask"
        v-show="visible"
        @click="onMaskClick"
      >
        <Transition
          name="modal-zoom"
          @after-leave="onAfterLeave"
        >
          <div
            v-show="visible"
            class="modal-container"
            :style="{
              width: typeof width === 'number' ? width + 'px' : width,
              '--offset-y': offsetY + 'px',
            }"
            @click.stop
          >
            <div class="modal-header">
              <slot name="header">提示</slot>
              <button
                class="modal-close"
                @click="close"
              >
                ×
              </button>
            </div>

            <div class="modal-body">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="modal-footer"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  closeOnMask?: boolean;
  width?: string | number;
  destroyOnClose?: boolean;
  offsetY?: number;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnMask: true,
  width: "480px",
  destroyOnClose: false,
  offsetY: -100,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

/**
 * 是否渲染内容（destroy-on-close 核心）
 */
const rendered = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      rendered.value = true;
    }
  },
);

function close() {
  visible.value = false;
  emit("close");
}

function onMaskClick() {
  if (props.closeOnMask) close();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && visible.value) {
    close();
  }
}

function onAfterLeave() {
  if (props.destroyOnClose) {
    rendered.value = false;
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 内容 */
.modal-container {
  background: var(--bg);
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  color: var(--text);
  transform: translateY(var(--offset-y));
}

/* 结构 */
.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--bg-light);
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 16px;
  border-bottom: 1px solid var(--bg-light);
  text-align: right;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* 遮罩动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 内容动画 */
.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.modal-zoom-enter-from,
.modal-zoom-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
