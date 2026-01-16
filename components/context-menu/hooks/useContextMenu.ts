import { ContextMenuItem } from "@/components/context-menu";

export function useContextMenu() {
  const visible = ref(false);
  const x = ref(0);
  const y = ref(0);

  const menus = shallowRef<ContextMenuItem[]>([]);

  function openContextMenu(e: MouseEvent) {
    visible.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  }

  return {
    visible,
    x,
    y,
    menus,
    openContextMenu,
  };
}
