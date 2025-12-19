import { createRouter, createWebHashHistory } from "vue-router";
import BasicLayout from "@/entrypoints/popup/layout/index.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: BasicLayout,
      redirect: "/bookmarks",
      children: [
        {
          path: "/bookmarks",
          component: () =>
            import("@/entrypoints/popup/pages/bookmarks/index.vue"),
        },
      ],
    },
  ],
});

export default router;
