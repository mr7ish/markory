import { createI18n } from "vue-i18n";
import { getLocale } from "./locale";

const modules = import.meta.glob("./messages/*.ts", { eager: true });

const messages: Record<string, any> = {};

Object.keys(modules).forEach((path) => {
  const locale = path.match(/\/(\w+)\.ts$/)?.[1];
  messages[locale!] = (modules[path] as any).default;
});

export const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: "en",
  messages,
});

export const t = i18n.global.t;
