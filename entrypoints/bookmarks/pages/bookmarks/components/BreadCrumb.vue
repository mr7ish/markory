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

const route = useRoute();
const router = useRouter();

const mapping = {
  folder: [
    {
      title: "全部文件夹",
      id: "folder",
    },
  ],
  focus: [
    {
      title: "特别关注",
      id: "focus",
    },
  ],
  recycle: [
    {
      title: "回收站",
      id: "recycle",
    },
  ],
};

const routes = shallowRef<{ title: string; id: string }[]>([]);

watch(
  () => route.query.id,
  () => {
    if (isNaN(Number(route.query.id))) {
      routes.value = mapping[route.query.id as keyof typeof mapping] || [];
      return;
    }

    const index = routes.value.findIndex((i) => i.id === route.query.id);

    if (index !== -1) {
      routes.value = routes.value.splice(index + 1);
      return;
    }

    routes.value = [
      ...routes.value,
      {
        id: route.query.id as string,
        title: route.query.title as string,
      },
    ];
  },
  {
    immediate: true,
  },
);

function jumpTo(route: { id: string; title: string }) {
  if (routes.value.length === 0) {
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
