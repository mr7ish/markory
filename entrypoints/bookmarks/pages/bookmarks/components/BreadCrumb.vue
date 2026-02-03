<template>
  <div class="bread-crumb-wrapper">
    <div
      v-for="(route, i) in routes"
      :key="route.id"
      class="crumb-item"
      :class="routes.length === 1 ? 'cursor-default' : ''"
      :title="route.title"
      @click="jumpTo(route)"
    >
      <div class="title text-overflow-hidden">{{ route.title }}</div>
      <IconTag
        v-if="i !== routes.length - 1"
        icon="ic:round-navigate-next"
        width="18"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconTag from "@/components/IconTag.vue";
import { useRoute, useRouter } from "vue-router";

export interface BreadCrumbRoute {
  title: string;
  id: string;
}

const { routes = [], menus = [] } = defineProps<{
  routes?: BreadCrumbRoute[];
  menus?: {
    title: string;
    id: string;
    icon: string;
    activeIcon: string;
  }[];
}>();

const emits = defineEmits<{
  setRoutes: [routes: BreadCrumbRoute[]];
}>();

const route = useRoute();
const router = useRouter();

watch(
  () => route.query.id,
  () => {
    console.log("breadcrumb => ", route);

    if (isNaN(Number(route.query.id))) {
      const target = menus.find((i) => i.id === route.query.id);
      emits(
        "setRoutes",
        target
          ? [target].map((i) => ({
              id: i.id,
              title: i.title,
            }))
          : [],
      );
      return;
    }

    const index = routes.findIndex((i) => i.id === route.query.id);

    if (index !== -1) {
      const _routes = routes.splice(index + 1);
      emits("setRoutes", _routes);
      return;
    }

    const _routes = [
      ...routes,
      {
        id: route.query.id as string,
        title: route.query.title as string,
      },
    ];

    emits("setRoutes", _routes);
  },
);

function jumpTo(route: { id: string; title: string }) {
  if (routes.length === 0) {
    return;
  }

  router.push({
    name: "bookmarks",
    query: {
      id: route.id,
      title: route.title,
    },
  });
}
</script>

<style scoped lang="less">
.bread-crumb-wrapper {
  display: flex;
  font-size: 16px;
  font-weight: bold;
  color: #888;

  .crumb-item {
    display: flex;
    align-items: center;
    cursor: pointer;

    &.cursor-default {
      cursor: default;
    }

    .title {
      padding: 4px;
      transition: color 0.5s ease;
      max-width: 100px;

      &:hover {
        color: var(--text);
      }
    }

    &:last-child {
      .title {
        color: var(--text);
      }
    }
  }
}
</style>
