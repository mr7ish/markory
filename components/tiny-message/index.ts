import { render, h } from "vue";
import MessageComponent from "./index.vue";
import "./style.css";

export type NoticeType = "success" | "warning" | "error" | "info";

export interface MessageOptions {
  type?: NoticeType;
  content?: string;
  duration?: number;
  onClose?: () => void;
}

export interface MessageInstance {
  close: () => void;
}

let messageRoot: HTMLDivElement | null = null;

function ensureMessageRoot(): HTMLDivElement {
  if (!messageRoot) {
    messageRoot = document.createElement("div");
    messageRoot.className = "tiny-message-root";
    document.body.appendChild(messageRoot);
  }
  return messageRoot;
}

interface MessageEntry {
  id: number;
  container: HTMLDivElement;
  timer: ReturnType<typeof setTimeout> | null;
  onClose?: () => void;
}

let nextId = 0;
const instances: MessageEntry[] = [];

function removeInstance(id: number) {
  const idx = instances.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const entry = instances[idx];
  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = null;
  render(null, entry.container);
  entry.container.remove();
  entry.onClose?.();
  instances.splice(idx, 1);
}

export function message(options: MessageOptions): MessageInstance {
  const { type = "info", content = "this is a message", duration = 3000, onClose } = options;

  const root = ensureMessageRoot();
  const container = document.createElement("div");
  container.className = "tiny-message-container";
  root.appendChild(container);

  const id = ++nextId;
  let timer: ReturnType<typeof setTimeout> | null = null;

  if (duration > 0) {
    timer = setTimeout(() => removeInstance(id), duration);
  }

  instances.push({ id, container, timer, onClose });

  render(h(MessageComponent, { type, content }), container);

  return {
    close: () => removeInstance(id),
  };
}

// 提供便捷方法
const success = (content: string, duration?: number, onClose?: () => void) =>
  message({ type: "success", content, duration, onClose });

const error = (content: string, duration?: number, onClose?: () => void) =>
  message({ type: "error", content, duration, onClose });

const warning = (content: string, duration?: number, onClose?: () => void) =>
  message({ type: "warning", content, duration, onClose });

const info = (content: string, duration?: number, onClose?: () => void) =>
  message({ type: "info", content, duration, onClose });

message.success = success;
message.error = error;
message.warning = warning;
message.info = info;
message.closeAll = closeAll;

function closeAll(): void {
  const ids = instances.map((i) => i.id);
  ids.forEach((id) => removeInstance(id));
}
