import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/i18n/module"],
  manifest: {
    permissions: ["bookmarks", "tabs", "tabGroups", "history", "storage", "contextMenus"],
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDesc__",
    default_locale: "en",
  },
  alias: {
    "@/bookmarks": "./entrypoints/bookmarks",
  },
});
