import ContextMenu from "./index.vue";

export default ContextMenu;

export interface ContextMenuItem {
  label: string;
  value: string;
  disabled?: boolean;
  divided?: boolean;
  danger?: boolean;
}
