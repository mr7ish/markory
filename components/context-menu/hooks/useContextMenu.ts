import { ContextMenuItem } from "@/components/context-menu";

export function useContextMenu() {
  const visible = ref(false);
  const x = ref(0);
  const y = ref(0);

  const menus = shallowRef<ContextMenuItem[]>([]);

  function openContextMenu(e: MouseEvent, _menus: ContextMenuItem[]) {
    if (_menus.length === 0) return;
    menus.value = _menus;
    x.value = e.clientX;
    y.value = e.clientY;
    visible.value = true;
  }

  return {
    visible,
    x,
    y,
    menus,
    openContextMenu,
  };
}
