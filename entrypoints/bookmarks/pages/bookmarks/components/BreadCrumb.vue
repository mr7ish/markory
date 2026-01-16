<template>
  <div class="bread-crumb-wrapper">
    <div
      v-for="(route, i) in routes"
      :key="route.id"
      class="crumb-item"
      :class="routes.length === 1 ? 'cursor-default' : ''"
      :title="route.title"
      @click="jumpFolder(route)"
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

const basic = [
  {
    title: "全部文件夹",
    id: "root",
  },
];

const routes = ref([...basic]);

watch(
  () => route.params.id,
  () => {
    if (route.params.id === "root") {
      routes.value = [...basic];
    } else {
      const index = routes.value.findIndex((i) => i.id === route.params.id);

      if (index !== -1) {
        routes.value.splice(index + 1);
        return;
      }

      routes.value.push({
        title: route.query.title as string,
        id: route.params.id as string,
      });
    }
  }
);

function jumpFolder(route: { id: string; title: string }) {
  if (routes.value.length === 0) {
    return;
  }

  router.push({
    name: "bookmarks-folder",
    params: {
      id: route.id,
    },
    query: {
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
