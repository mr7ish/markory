import { watchOnce } from "@vueuse/core";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { defineStore } from "pinia";

export interface BreadCrumbRoute {
  title: string;
  id: string;
}

export const useRoutesStore = defineStore("routesStore", () => {
  const menus = [
    {
      title: "全部文件夹",
      id: "folder",
      icon: "basil:folder-open-outline",
      activeIcon: "basil:folder-open-solid",
    },
    {
      title: "特别关注",
      id: "focus",
      icon: "si:heart-line",
      activeIcon: "si:heart-fill",
    },
    {
      title: "分组",
      id: "group",
      icon: "material-symbols:tab-group-outline",
      activeIcon: "material-symbols:tab-group",
    },
    {
      title: "回收站",
      id: "recycle",
      icon: "basil:trash-outline",
      activeIcon: "basil:trash-solid",
      // icon: "flowbite:trash-bin-outline",
      // activeIcon: "flowbite:trash-bin-solid",
    },
  ];

  const {
    data: routes,
    set: setRoutes,
    isFinished: isRoutesFinished,
  } = useIDBKeyval<BreadCrumbRoute[]>("bread-crumb-routes", [], {
    shallow: true,
  });

  const queryId = computed(() => {
    return routes.value.length > 0 ? routes.value[routes.value.length - 1].id : "folder";
  });

  const activeMenu = ref(menus[0].id);

  watchOnce(isRoutesFinished, (isFinished) => {
    if (!isFinished) return;
    if (routes.value.length === 0) {
      setRoutes([
        {
          title: menus[0].title,
          id: menus[0].id,
        },
      ]);
      return;
    }
    setActiveMenu(routes.value[0].id);
  });

  function setActiveMenu(id: string) {
    activeMenu.value = id;
  }

  return {
    menus,
    activeMenu,
    setActiveMenu,
    routes,
    queryId,
    setRoutes,
    isRoutesFinished,
  };
});
