import { createRouter, createWebHashHistory } from "vue-router";
import BasicLayout from "@/entrypoints/bookmarks/layout/index.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: BasicLayout,
      redirect: () => {
        return {
          name: "bookmarks",
        };
      },
      children: [
        {
          path: "bookmarks",
          name: "bookmarks",
          component: () => import("@/bookmarks/pages/bookmarks/index.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/bookmarks/pages/settings/index.vue"),
        },
      ],
    },
  ],
});

export default router;
