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
          // query: {
          //   id: "folder",
          // },
        };
      },
      children: [
        {
          path: "bookmarks",
          name: "bookmarks",
          component: () => import("@/bookmarks/pages/bookmarks/index.vue"),
        },
      ],
    },
  ],
});

export default router;
