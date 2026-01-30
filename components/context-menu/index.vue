<template>
  <Teleport to="body">
    <ul
      v-show="visible"
      ref="menuRef"
      class="context-menu"
      :style="style"
      @contextmenu.prevent
    >
      <template
        v-for="(item, index) in menus"
        :key="index"
      >
        <li
          v-if="item.divided"
          class="divider"
        />

        <li
          v-else
          class="menu-item"
          :class="{ disabled: item.disabled, danger: item.danger }"
          @click="onItemClick(item)"
        >
          {{ item.label }}
        </li>
      </template>
    </ul>
  </Teleport>
</template>

<script setup lang="ts">
import { ContextMenuItem } from ".";

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  menus: ContextMenuItem[];
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "select", item: ContextMenuItem): void;
}>();

const menuRef = ref<HTMLElement | null>(null);

const style = computed(() => ({
  left: props.x + "px",
  top: props.y + "px",
}));

const close = () => emit("update:visible", false);

const onItemClick = (item: ContextMenuItem) => {
  if (item.disabled) return;
  emit("select", item);
  close();
};

// 防止菜单超出屏幕
const adjustPosition = () => {
  const el = menuRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  let x = props.x;
  let y = props.y;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (x + rect.width > vw) {
    x = vw - rect.width - 8;
  }
  if (y + rect.height > vh) {
    y = vh - rect.height - 8;
  }

  el.style.left = x + "px";
  el.style.top = y + "px";
};

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      await nextTick();
      adjustPosition();
    }
  },
);

// 关闭逻辑
const onClickOutside = (e: MouseEvent) => {
  if (!menuRef.value) return;
  if (!menuRef.value.contains(e.target as Node)) {
    close();
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    close();
  }
};

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  min-width: 160px;
  padding: 6px 4px;
  background-color: var(--bg-light);
  border-radius: 8px;
  /* box-shadow: var(--shadow-s); */
  font-size: 14px;
  color: var(--text);
  z-index: 9999;
}

.menu-item {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: var(--context-menu-item-hover-bg);
}

.menu-item.danger {
  color: #f56c6c;
}

.menu-item.danger:hover {
  background-color: var(--context-menu-item-danger-hover-bg);
}

.menu-item.disabled {
  color: #aaa;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  background: transparent;
}

.divider {
  height: 1px;
  margin: 6px 0;
  background-color: var(--context-menu-divider);
}
</style>
