import { createRouter, createWebHashHistory } from "vue-router";
import BasicLayout from "@/entrypoints/bookmarks/layout/index.vue";
import BookmarksLayout from "@/entrypoints/bookmarks/pages/bookmarks/index.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: BasicLayout,
      redirect: "/bookmarks",
      children: [
        {
          path: "bookmarks",
          name: "bookmarks",
          component: BookmarksLayout,
          redirect: {
            name: "bookmarks-folder",
            params: { id: "root" },
          },
          children: [
            {
              path: "folder/:id",
              name: "bookmarks-folder",
              component: () =>
                import(
                  "@/entrypoints/bookmarks/pages/bookmarks/components/FolderPage.vue"
                ),
            },
          ],
        },
      ],
    },
  ],
});

export default router;
