import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["bookmarks", "tabs", "history", "storage"],
  },
  alias: {
    "@/bookmarks": "./entrypoints/bookmarks",
  },
});
